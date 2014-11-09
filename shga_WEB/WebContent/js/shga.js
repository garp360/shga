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
	}).when('/login', {
		templateUrl : 'template/login.html',
		reloadOnSearch : false
	}).when('/register', {
		templateUrl : 'template/register.html',
		reloadOnSearch : false
	}).when('/profile/:uid', {
		templateUrl : 'template/profile.html',
		reloadOnSearch : false
	}).when('/event', {
		templateUrl : 'template/event.html',
		reloadOnSearch : false
	});
});
