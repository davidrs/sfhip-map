#! /usr/bin/env Rscript

# File description -------------------------------------------------------------
# This script will collect the SF crime data from 2014 and aggregate it by census tract and police district.
# It exports the data for a select number of crimes, which are set explicitly later in the script.
# Obvious modifications will add or remove filters.
# The resulting csvs are deposited in the data directory.

# Setup packages ---------------------------------------------------------------
# Note: This requires the installation of rgdal and rgeos, which may require external binaries.
# List of packages for session
.packages = c("plyr",
              "readr",
              "dplyr",
              "reshape2",
              "rgdal",
              "rgeos",
              "sp",
              "lubridate"
)

# Install CRAN packages (if not already installed)
.inst <- .packages %in% installed.packages()
if(length(.packages[!.inst]) > 0) install.packages(.packages[!.inst])

# Load packages into session
lapply(.packages, require, character.only=TRUE)
cat("\014")  # Clear console

# Read in crime data, turn it in to an sp SpatialDataFrame
crimeDF <- read_csv('https://www.dropbox.com/s/cfen9q97h3mc7xx/Map__Crime_Incidents_-_from_1_Jan_2003.csv?dl=1')
crimeSpatDF <- as.data.frame(crimeDF)
coordinates(crimeSpatDF) <- ~X+Y

# Read in tracts data from GeoJSON
download.file('https://raw.githubusercontent.com/davidrs/sfhip-map/master/data/sfTracts.json', "sfTracts.json", method = "curl")
tractsJSON <- rgdal::readOGR("sfTracts.json", "OGRGeoJSON")

# Make sure projections for DFs are the same
sp::proj4string(crimeSpatDF) <- sp::proj4string(tractsJSON)

# Compute which tract each point is in
tractIn <- sp::over(crimeSpatDF, tractsJSON)

# Join tract information to original data
crimeJoined <- bind_cols(crimeDF,tractIn)

# Group by crime type, tract and aggregate
crimeStats <- crimeJoined %>% group_by(Category, TRACT) %>% summarize(total_crimes = n())

# Standardize column names
colnames(crimeStats) <- c("category", "tract_id", "total_crimes")

# Filter to desired crime type, list of possible options is in possibleCrimes DF
possibleCrimes <- unique(crimeStats$category)
desiredCrimes <- c("ARSON", "VANDALISM")
crimeSuffix <- paste(desiredCrimes, collapse = "_")
filteredCrime <- crimeStats[crimeStats$category %in% desiredCrimes, ]

# Write to file
fileNameTract <- paste('../data/crimestats_by_tract_', crimeSuffix, '.csv', sep= "")
write_csv(filteredCrime, fileNameTract)

# Filter to desired crime type, list of possible options is in possibleCrimes DF
filteredCrimeDistrict <- crimeJoined[crimeJoined$Category %in% desiredCrimes, ]

# Parse dates
filteredCrimeDistrict$Date <- as.Date(stringr::str_extract(string = filteredCrimeDistrict$Date, pattern = "\\d{2}/\\d{2}/\\d{4}"), format = "%m/%d/%Y")

# Filter to past year
present <- as.Date(lubridate::now())
filteredCrimeDistrict <- filteredCrimeDistrict[present - filteredCrimeDistrict$Date < 365, ]

# Aggregate by police district
crimeStatsDistrict <- filteredCrimeDistrict %>% group_by(PdDistrict) %>% summarize(total_crimes = n())

# Standardize column names
colnames(crimeStatsDistrict) <- c("police_district", "total_crimes")

# Write to file
fileNameDistrict <- paste('../data/crimestats_by_district_', crimeSuffix, '.csv', sep= "")
write_csv(filteredCrimeDistrict, fileNameDistrict)
