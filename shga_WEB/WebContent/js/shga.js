var app = angular.module('shgaApp', [ 'firebase', 'ui.bootstrap', 'ngRoute', 'ngTouch', 'mobile-angular-ui', 'shgaApp.factories', 'shgaApp.filters', 'shgaApp.controllers' ]);

app.config(function(datepickerConfig, datepickerPopupConfig) {
	datepickerConfig.showWeeks = false;
	datepickerPopupConfig.toggleWeeksText = null;
	datepickerPopupConfig.startingDay = 0;
});

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'template/home.html',
		reloadOnSearch : false
	});
});
