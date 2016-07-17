Demo: http://davidrs.github.io/sfhip-map/

Code was written for SFHIP at Code for SF hack nights.


## Running the Code Locally

1. Clone the repo.
2. On the command line ```cd``` into the folder you cloned the code to.
3. From the command line run ```python -m SimpleHTTPServer```
4. You should see a message like: ```Serving HTTP on 0.0.0.0 port 8000 ...```
5. Open this website in chrome: http://localhost:8000


## Data

Data is from SFHIP  google drive folders, 


- Actual # of Licenses: ```.../New Files/counts_census_by_alcohol_license_melted.csv```
- Quota or limit: ```.../ABC_licenses_by_census_tract/ABC_licenses_by_census_tract.csv```
- GeoJson of Tracts: ```.../New Files/sftracts.json````

As best I can tell it's 2014 data. Note there are three or four versions of some of these files with small but important differences.


## Code

The code uses LeafletJS the standard for open source mapping projects.
Currently uses MapBox default for tile serving, should migrate to something scalable and free. OSM etc.

## How to export funky Esri shape files

- Qgis open shape file
- select the layer then 'save as...'
- choose "WGS84" as the projection and choose 'seclted crs' from drop down during the save.

