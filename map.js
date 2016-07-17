var LICENSES_CSV = "data/abc_map_2016.csv";
var DISTRICTS_CSV = "data/neighborhood_district.csv";

var CENSUS_TRACT_COL = "CTract";

//Neighborhood.csv uses a different column header name for census tract
var CENSUS_TRACT_COL_NEIGHBORHOODS = "censusTract";

// Keyed off of census tract, has offSite.quota: #, offSite.actual#:
var combinedData = {};

// Data to be shown on the map.
var mapData = combinedData;

var OFFSITE_LABEL = "offSite";
var ONSITE_LABEL = "onSite";
var currentView = OFFSITE_LABEL;

// TODO: variable for on site license codes: 20 and 21
// TODO: variable for off site license codes: 48, 41, 40
var views = {};
views[OFFSITE_LABEL] = {
	title: 'Off-Sale Alcohol Licenses (Type 20 and 21)',
};
views[ONSITE_LABEL] = {
	title: 'On-Sale Alcohol Licenses (Type 40,41, 42, 47 and 48)',
};


// Leaflet map object.
var map;

// Leaflet legend object.
var legend;

// Leaflet info box.
var info;

var rawTractsGeoJson = {};

// GeoJson leaflet layer for the census tracts.
var geojson;

// Setup the leaflet map and legend;
var setupMap = function(){
	map = L.map('map').setView([37.75, -122.43], 12);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZHJ1c3RzbWkiLCJhIjoiTXV3RzNpNCJ9.44L5G1S6U6aPxFJeQnhmUQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	}).addTo(map);

	setupLegend();	
	setupInfoBox();	
	loadCSVs();

	new L.Control.GeoSearch({
	    provider: new L.GeoSearch.Provider.OpenStreetMap()
	}).addTo(map);
};

var changeView = function(label){
	currentView = label;
	geojson.setStyle(style);
	tenderloinLayer.setStyle(style);
	info.update();

}

var loadCSVs = function(){
	d3.csv(LICENSES_CSV, function(rows){
		rows.forEach(function(d){
			//quota
			censusTract = Math.round(+d[CENSUS_TRACT_COL] * 100)
			if (!combinedData[censusTract]){
				combinedData[censusTract] = {onSite:{quota:null, actual:null}, offSite:{quota:null, actual:null}};
			} 
			//OnSale_actual,OffSale_actual,OnSale_auth,OffSale_auth
			combinedData[censusTract].offSite.quota = +d["OffSale"];
			combinedData[censusTract].onSite.quota = +d["OnSale"];
			combinedData[censusTract].offSite.actual = +d["OffSale_auth"]; ///  ABC calls actual auth. that's why this is confusing.
			combinedData[censusTract].onSite.actual = +d["OnSale_auth"];
			console.log('d', d);
			console.log(combinedData);
		});
		d3.csv(DISTRICTS_CSV, function(rows){
			rows.forEach(function(d){
				if (!combinedData[d[CENSUS_TRACT_COL_NEIGHBORHOODS]]){
					combinedData[d[CENSUS_TRACT_COL_NEIGHBORHOODS]] = {onSite:{}, offSite:{}};
				}
				combinedData[d[CENSUS_TRACT_COL_NEIGHBORHOODS]].neighborhood = d.neighborhood;
				combinedData[d[CENSUS_TRACT_COL_NEIGHBORHOODS]].superVisorDistrict = d.superVisorDistrict;				
			});
			loadGeoJson();
		});
	});
}


// Determines colour of map polygons.
var getColor = function(d) {
	return d > 1.5 ? '#800012' :
	       d >= 1.01  ? '#FC532A' :
	       d >= 1.0  ? '#ffcc00' :
	       d > 0.5   ? '#D9FE76' :
	       d >= 0.0   ? '#B2FE3C' :
	                  '#EEE';
}

// Style of colour of map polygons.
var style = function(feature) {
	var censusTract= +feature.properties.TRACT;
	return {
		weight: 1,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.6,
		fillColor: getColor(getRatio(censusTract, currentView))
	};
}

var highlightFeature = function(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

var resetHighlight = function(e) {
	geojson.resetStyle(e.target);
	info.update();
}

var zoomToFeature = function(e) {
	map.fitBounds(e.target.getBounds());
}


var onEachFeature = function(feature, layer) {
	var censusTract = +feature.properties.TRACT;
	feature.properties.censusTract = censusTract;
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// Pretty round a # to 2 decimal digits.
var prettyRound = function(number){
	return Math.round(number * 100);
}

// Get the ratio of actual to quota for a specific census tract.
var getRatio = function(censusTract, label){
	return (combinedData[censusTract][label].actual / combinedData[censusTract][label].quota);
}

// Get the difference between the quote and actual # of licenses for a specific census tract.
var getDelta = function(censusTract, label){
	return (combinedData[censusTract][label].quota - combinedData[censusTract][label].actual);
}

// Load geojson of SanFrancisco census tracts.
var loadGeoJson = function(){
	d3.json("data/sfTracts.json", function(err, sfTracts){
		geojson = L.geoJson(sfTracts, {
			style: style,
			onEachFeature: onEachFeature
		}).addTo(map);

		tenderloinLayer = L.geoJson(sfTracts, {
			style: style,
			onEachFeature: onEachFeature
		});

		tenderloinLayer.getLayers().forEach(function(layer){
			if (layer.feature.properties.censusTract <  12201 || layer.feature.properties.censusTract > 12502){
				tenderloinLayer.removeLayer(layer);
			}
		})
	});

	map.attributionControl.addAttribution('TODO. find source &copy; <a href="#">source</a>');
}

// Load geojson for the Safe Passage area in the tenderloin. 
// !!Currently unused.
var loadSafePassage = function(){
	d3.json("data/safePassage.json", function(err, safePassage){
		safePassageGeojson = L.geoJson(safePassage, {
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


var setupLegend = function(){
	legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 0.5, 1.0, 1.01, 1.5],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 0.001) + '"></i> ' +
				prettyRound(from) + (from == 1 ? '': (to ? '&ndash;' + prettyRound(to) : '+'))+'%');
		}
	 	div.innerHTML = "<strong>Actual Licenses / Authorized #</strong><br />"
		div.innerHTML += labels.join('<br>');
		return div;
	};

	legend.addTo(map);
};

var setupInfoBox = function(){
	// Control that shows state info on hover
	info = L.control();
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		var label = "offSite";
		if(currentView == ONSITE_LABEL) {
			label = "onSite";
		}
		if (!props || !props.censusTract){
			this._div.innerHTML = '<h4>'+ views[label].title +'</h4>' + 'Hover over an area';
			return;
		}
		var tract = props.censusTract;
		
		this._div.innerHTML = '<h4>'+ views[label].title +'</h4>' +
			'<b>Census Tract: ' + tract + '</b><br />' 
			+ 'Neighborhood: ' + combinedData[tract].neighborhood +'<br />'
			+ 'Supervisor District: ' + combinedData[tract].superVisorDistrict +'<br /><hr/>'
			+ '<b>' + prettyRound(getRatio(tract, label)) + '% of Authorized #</b><br />'
			+ combinedData[tract][label].actual + ' Actual #<br />'
			+ combinedData[tract][label].quota + ' Authorized #<br />'
			+ getDelta(tract,label) + ' Authorized - Actual<br />';
	};
	info.addTo(map);
}

