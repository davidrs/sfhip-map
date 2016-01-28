var drawCrimePrecincts = function(){
	d3.json("data/sfPrecincts.json", function(err, safePassage){
		crimeGeojson = L.geoJson(safePassage, {
			style: {
				weight: 3,	
				opacity: 1,
				color: 'black',
				fillOpacity: 0.01,
				fillColor: 'gray'
			}
		}).addTo(map);
	});
};