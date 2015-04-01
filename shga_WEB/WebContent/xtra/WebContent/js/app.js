var app = angular.module('ng2rest', ['ngRoute', 'ngCookies', 'restangular', 'controller.module', 'factory.module']);

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		reloadOnSearch: true,
		templateUrl : 'view/home.html',
		controller: "HomeController"
	}).when('/detail/:userId', {
		templateUrl : 'view/detail.html',
		controller: "DetailController",
		resolve : {
			action: function() {
				return "edit";
			}
		}
	}).when('/create', {
		templateUrl : 'view/detail.html',
		controller: "DetailController",
		resolve : {
			action: function() {
				return "create";
			}
		}
	}).when('/import', {
		templateUrl : 'view/import.html',
		controller: "ImportController"
	}).otherwise({redirectTo: '/'});
});

app.config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl('/restex');
	RestangularProvider.setDefaultHttpFields({cache: false});
});