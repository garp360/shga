angular.module('controller.module').controller("HomeController",['$scope', '$http', '$routeParams', '$location', '$log', '$cookieStore', 'User', function($scope, $http, $routeParams, $location, $log, $cookieStore, User) {
	angular.extend(this, new BaseController($scope));
	$scope.data = [];
	$scope.controllerName = "HomeController";
	$scope.criteria = $cookieStore.get('homeUserCriteria');

	if($scope.criteria) {
		User.search({firstName: $scope.criteria.firstname, lastName: $scope.criteria.lastname}).then(function(users) {
			$scope.data = users;
		}, function(err) {
			$scope.data = "Rest call failed!";
		});
	} else {
		$cookieStore.put('homeUserCriteria', {});
	};
	
	$scope.clear = function() {
		$scope.data = [];
		$scope.criteria = {};	
		$cookieStore.put('homeUserCriteria', $scope.criteria);
	};
	
	$scope.search = function() {
		$cookieStore.put('homeUserCriteria', $scope.criteria);
		User.search({firstName: $scope.criteria.firstname, lastName: $scope.criteria.lastname}).then(function(users) {
			$scope.data = users;
		}, function(err) {
			$scope.data = "Rest call failed!";
		});
	};
	
	$scope.deleteUser = function(userId) {
		User.remove({deleteId: userId, firstName: $scope.criteria.firstname, lastName: $scope.criteria.lastname}).then(function(users) {
			$scope.data = users;
		}, function(err) {
			$scope.data = "Rest call failed!";
		});
	};

	// Function will Activate/Deactivate the selected user
	$scope.activate = function(user, active) {
		User.update({userId: user.id, firstName: user.firstname, lastName: user.lastname, isActive : active}).then(function(updatedUser) {
			user.isActive = updatedUser.isActive;
		}, function(err) {
			$scope.data = "Rest call failed!";
		});
	};
	
}]);