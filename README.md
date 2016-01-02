Demo: http://rawgit.com/davidrs/sfhip-map/master/index.html

Code was written for SFHIP at Code for SF hack nights.


## Data

Data is from SFHIP  google drive folders, 


- Actual # of Licenses: ```.../New Files/counts_census_by_alcohol_license_melted.csv```
- Quota or limit: ```.../ABC_licenses_by_census_tract/ABC_licenses_by_census_tract.csv```
- GeoJson of Tracts: ```.../New Files/sftracts.json````

As best I can tell it's 2014 data. Note there are three or four versions of some of these files with small but important differences.


## Code

The code uses LeafletJS the standard for open source mapping projects.
Currently uses MapBox default for tile serving, should migrate to something scalable and free. OSM etc.
