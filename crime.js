var loadCrimePrecincts = function(){
	d3.json("data/sfPrecincts.json", function(err, precincts){
		crimeGeojson = L.geoJson(precincts, {
			style: {
				weight: 2,	
				opacity: 1,
				color: 'black',
				fillOpacity: 0.01,
				fillColor: 'gray'
			}
		});
	});
};

var loadNeighbourHoods = function(){
	d3.json("data/sfNeighbourhoods.json", function(err, neighbourhoods){
		neighbourhoodGeojson = L.geoJson(neighbourhoods, {			
			style: {
				weight: 2,	
				opacity: 1,
				color: 'black',
				fillOpacity: 0.01,
				fillColor: 'gray'
			}
		});
	});
}

// Toggle code.
var toggleTenderloin = function() {
	if (map.hasLayer(tenderloinLayer)){
		map.removeLayer(tenderloinLayer);
		map.addLayer(geojson);
	} else {
		map.removeLayer(geojson);
		map.addLayer(tenderloinLayer);
	}
};

var toggleCrime = function () {
	if (map.hasLayer(crimeGeojson)){
		map.removeLayer(crimeGeojson);
		crimeGeojson
	} else {
		map.removeLayer(neighbourhoodGeojson);
		map.addLayer(crimeGeojson);
		crimeGeojson.bringToBack();
	}
}

var toggleNeighbourhood = function () {
	if (map.hasLayer(neighbourhoodGeojson)){
		map.removeLayer(neighbourhoodGeojson);
	} else {
		map.removeLayer(crimeGeojson);
		map.addLayer(neighbourhoodGeojson);
		neighbourhoodGeojson.bringToBack();
	}
}
