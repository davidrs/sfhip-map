var ALLOWED_LICENSES_CSV = "data/allowed.csv";
var ACTUAL_LICENSES_CSV = "data/actual.csv";
// Keyed off of census tract, has offSiteQuota: #, offSiteActual#:
var combinedData = {};

var bothCsvsDone = false;

var loadCSVs = function(){
	allowedLicenseCounts = d3.csv(ALLOWED_LICENSES_CSV, function(rows){
		rows.forEach(function(d){
			censusTract = Math.round(+d["Census Tract # "] * 100)
			if (!combinedData[censusTract]){
				combinedData[censusTract] = {}
			}
			combinedData[censusTract].offSiteQuota = +d["Off Sale "];
		});
		actualLicenseCounts = d3.csv(ACTUAL_LICENSES_CSV, function(rows){
			rows.forEach(function(d){
				if (!combinedData[d["Census_tra"]]){
					combinedData[d["Census_tra"]] = {}
				}
				if (d["License_Ty"] == "20" || d["License_Ty"] == "21"){
					if (!combinedData[d["Census_tra"]].offSiteActual){
						combinedData[d["Census_tra"]].offSiteActual = +d["n_stores"];
					} else {
						combinedData[d["Census_tra"]].offSiteActual += +d["n_stores"];
					}
				} else {
					// Not an offsite one, but this means we have data for the tract, so should count 0;
					if (!combinedData[d["Census_tra"]].offSiteActual){
						combinedData[d["Census_tra"]].offSiteActual = 0;
					}
				}
			});
			loadGeoJson();
		});
	});
}

var map = L.map('map').setView([37.75, -122.43], 12);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.light'
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
	//console.log(props)
	this._div.innerHTML = '<h4>Off Site Aclohol Licenses</h4>' +  (props ?
		'<b>Census Tract: ' + props.TRACT + '</b><br />' 
		+ props.offSiteActual + ' actual<br />'
		+ props.offSiteQuota + ' quota<br />'
		+ props.offSiteDelta + ' quota - actual<br />'
		+ prettyRound(props.offSiteRatio) + ' actual/quota<br />'
		: 'Hover over an area');
};

info.addTo(map);


// get color for each census tract.
function getColor(d) {
	return d > 3 ? '#800026' :
	       d > 2.5  ? '#BD0026' :
	       d > 2.0  ? '#E31A1C' :
	       d > 1.5  ? '#FC4E2A' :
	       d > 1.0  ? '#FD8D3C' :
	       d > 0.5   ? '#D9FE76' :
	       d >= 0.0   ? '#B2FE4C' :
	                  '#EEE';
	                  /*
	return d > 3 ? '#800026' :
	       d > 2.5  ? '#BD0026' :
	       d > 2.0  ? '#E31A1C' :
	       d > 1.5  ? '#FC4E2A' :
	       d > 1.0  ? '#FD8D3C' :
	       d > 0.5   ? '#FEB24C' :
	       d >= 0.0   ? '#FED976' :
	                  '#EEE';*/
}

function style(feature) {
	var censusTract= +feature.properties.TRACT;
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColor(combinedData[censusTract].offSiteActual/combinedData[censusTract].offSiteQuota)
	};
}

function highlightFeature(e) {
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

var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}


function onEachFeature(feature, layer) {
	var censusTract = +feature.properties.TRACT;
	feature.properties.offSiteQuota = combinedData[censusTract].offSiteQuota;
	feature.properties.offSiteActual = combinedData[censusTract].offSiteActual;
	feature.properties.offSiteRatio = combinedData[censusTract].offSiteActual / combinedData[censusTract].offSiteQuota;
	feature.properties.offSiteDelta = combinedData[censusTract].offSiteQuota - combinedData[censusTract].offSiteActual;
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// Pretty round a # to 2 decimal digits.
var prettyRound = function(number){
	return Math.round(number * 100)/100;
}

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
		labels = [],
		from, to;

	for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColor(from+ 0.001) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;
};
	legend.addTo(map);

var loadGeoJson = function(){
	geojson = L.geoJson(sfTracts, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);


	safePassageGeojson = L.geoJson(safePassage, {
		style: {
			weight: 1,
			opacity: 1,
			color: 'black',
			fillOpacity: 0.8,
			fillColor: 'yellow'
		}
	}).addTo(map);

	map.attributionControl.addAttribution('Alcohol data &copy; <a href="#">ABC</a>');
}


loadCSVs();
