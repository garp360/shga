angular.module('shgaApp.controllers.Credentials', []).controller('CredentialsController', [ "$scope", "$log", "$routeParams", "$location", "Profile", "Registration", "ShgaEvent", function($scope, $log, $routeParams, $location, Profile, Registration, ShgaEvent) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.showMessage = false;
	$scope.email = "asdasd";
	$scope.message = "";
	
	$scope.reset = function() {
		console.log("email = " + $scope.email);
		Registration.resetPassword(rootRef, {email : $scope.email})
		.then(function(successMsg){
			$scope.message = successMsg;
			$scope.showMessage = true;
		},function(errMsg){
			$scope.message = errMsg;
			$scope.showMessage = true;
		});
	};

	$scope.cancel = function() {
		__back();
	};

	$scope.cancel = function() {
		__back();
	};
	
	function __back() {
		$location.path('/', false);
	}
} ]);