var drawCrimePrecincts = function(){
	d3.json("data/sfPrecincts.json", function(err, safePassage){
		crimeGeojson = L.geoJson(safePassage, {
			style: {
				weight: 1,	
				opacity: 1,
				color: 'black',
				fillOpacity: 0.8,
				fillColor: 'yellow'
			}
		}).addTo(map);
	});
};