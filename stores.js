// File for all code about loading the stores.

//


// Array of starbucks, and tacobells.
var stores = [];

var storeMarkers = [];

var hideStores = function(){
	storeMarkers.forEach(function(marker){
		map.removeLayer(marker);
	});
}

var showStores = function(){
	if (storeMarkers.length == 0){
		drawStores();
	} else {
		storeMarkers.forEach(function(marker){
			map.addLayer(marker);
		});
	}
}

// Draws starbucks and tacobells in SF.
var drawStores = function() {
	if (stores.length <= 0){
		// Load stores will callback drawStores when it's done, then run below code.
		loadStores();
	} else {
  		geocoder = new google.maps.Geocoder();
		stores.forEach(function(store){
			var icon = 'icon_green.png';
			if (store.alcohol == 1) {
				icon = 'icon_red.png';
			} else if (store.type == "TACO BELL"){
				icon = 'icon_blue.png';				
			}

			storeMarkers.push(L.marker([store.lat, store.lng])
				.setIcon(L.icon({iconUrl: icon}))
				.bindPopup("<b>"+store.type+"</b><br>" + store.address + (store.alcohol == 1? "<br />applied for licence":""))
				.addTo(map));
		});
	}
};

var loadStores = function(){
	// Load the stores.
	d3.csv('data/starbucks_tacobell.csv', function(rows){
		rows.forEach(function(d){
			stores.push({
				type: d.STORE,
				address: d.Street_Address,
				lat: +d.X,
				lng: +d.Y,
				alcohol: +d.Alcohol // 1 applied for a license, 0 did not.
			});
		});
		drawStores();
	});
};


// Unused helper function to geocode stores without lat lng. Just run once and copy log to CSV.
var geocoder = function(store){
	if(store.lat == 0){
		  geocoder.geocode( {address: store.address + ", San Francisco"}, function(results, status) 
		  {
		    if (status == google.maps.GeocoderStatus.OK) 
		    {
		      console.log(store.address, results[0].geometry.location.lat(),",", results[0].geometry.location.lng() );
		    }
		  });
	}
}
