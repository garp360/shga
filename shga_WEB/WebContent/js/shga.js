var app = angular.module('shgaApp', [ 'firebase', 'ui.bootstrap', 'ngRoute', 'ngTouch', 
                                      'mobile-angular-ui', 'shgaApp.factories', 'shgaApp.filters', 
                                      'shgaApp.controllers', 'shgaApp.directives' ]);

app.config(function(datepickerConfig, datepickerPopupConfig) {
	datepickerConfig.showWeeks = false;
	datepickerPopupConfig.toggleWeeksText = null;
	datepickerPopupConfig.startingDay = 0;
});

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'template/home.html',
		reloadOnSearch : false
	}).when('/home', {
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
	}).when('/profile/:uid/:eventId', {
		templateUrl : 'template/profile.html',
		reloadOnSearch : false
	}).when('/event', {
		templateUrl : 'template/event.html',
		reloadOnSearch : false
	}).when('/outing/:eventId', {
		templateUrl : 'template/outing.html',
		controller : 'OutingController',
		reloadOnSearch : false
	}).when('/outing/:eventId', {
		templateUrl : 'template/outing.html',
		controller : 'OutingController',
		reloadOnSearch : false
	}).when('/golfers/:eventId', {
		templateUrl : 'template/golfers.html',
		reloadOnSearch : false
	}).otherwise({redirectTo: '/'});
});
