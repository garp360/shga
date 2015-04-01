angular.module('controller.module').controller("DetailController",['$scope', '$http', '$location', '$routeParams', '$cookieStore', 'User', 'action', function($scope, $http, $location, $routeParams, $cookieStore, User, action) {
	angular.extend(this, new BaseController($scope));

	var userId = $routeParams.userId;
	$scope.controllerName = "DetailController";
	$scope.loaded = false;
	$scope.user = {};
	$scope.isCreate = angular.equals(action, "create");
	$scope.isEdit = angular.equals(action, "edit");
	
	if(!$scope.isCreate) {
		User.findById({
			id : userId
		}).then(function(user) {
			$scope.user = user;
			$scope.loaded = true;
		}, function(err) {
			$scope.data = "Rest call failed!";
			$scope.loaded = true;
		});
	} else {
		$scope.loaded = true;
	}
	
	$scope.save = function() {
		User.create({firstName: $scope.user.firstname, lastName: $scope.user.lastname}).then(function(users){
			$cookieStore.put('homeUserCriteria', $scope.user);
			$location.url("/");
		}, function(err) {
			$scope.data = "Rest call failed!";
		});
	};

}]);