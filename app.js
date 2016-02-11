// Entry point to the entire app.
var start = function(){
	setupUiListeners();
	setupMap();
	loadCrimePrecincts();
	loadNeighbourHoods();
};


var setupUiListeners = function(){
	$(".map-type").click(function(){
		changeView($(this).attr('id'));
		hideStores();
		$(".tab").removeClass("active");
		$(this).addClass("active");
	});
	$("#onSiteStores").click(function(){
		changeView("onSite");
		showStores();
		$(".tab").removeClass("active");
		$(this).addClass("active");
	});
	$("#toggleTenderloin").click(function(){
		toggleTenderloin();
	});
	$("#toggleCrime").click(function(){
		toggleCrime();
	});
	$("#toggleNeighbourhood").click(function(){
		toggleNeighbourhood();
	});
};

start();
