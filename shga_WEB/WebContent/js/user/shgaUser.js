angular.module('shgaApp.User', []).controller('RegistrationController', function($scope, $modalInstance) {
	$scope.title = "SHGA Registration";
	$scope.teeboxes = [ {
		color : 'Gold'
	}, {
		color : 'Black'
	}, {
		color : 'Blue'
	}, {
		color : 'White'
	}, {
		color : 'Green'
	}, {
		color : 'Burgundy'
	} ];
	$scope.registrant = {
	    hcp : 10.0,
	    teebox : $scope.teeboxes[1]
	};

	$scope.ok = function() {
		var sec = $scope.registrant;
		$modalInstance.close(sec);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});