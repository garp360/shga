angular.module('shgaApp.Golfer', []).controller('ProfileController', [ "$scope", "$modalInstance", "profile", function($scope, $modalInstance, profile) {
	$scope.profile = profile;
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
	var found = false;
	angular.forEach($scope.teeboxes, function(teebox) {
		if (teebox.color.toLowerCase() == $scope.profile.teebox.color.toLowerCase() && !found) {
			found = true;
			$scope.profile.teebox = teebox;
		}
	});

	$scope.title = "Edit Profile (" + $scope.profile.firstName + " " + $scope.profile.lastName + ")";

	$scope.ok = function() {
		$modalInstance.close($scope.profile);
	};

	$scope.cancel = function() {
		$scope.profile = {};
		$modalInstance.dismiss('cancel');
	};
} ]);