angular.module('shgaApp.controllers.PwChangeController', []).controller('PwChangeController', [ "$scope", "$log", "$routeParams", "$location", "Profile", "ShgaEvent", function($scope, $log, $routeParams, $location, Profile, ShgaEvent) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	var userId = $routeParams.uid;
	$scope.profile = {};
	$scope.pwd1 = "";
	$scope.pwd2 = "";
	$scope.showPwdMatchError = false;
	$scope.showMessage = false;
	$scope.pwdMatchError = "The passwords do not match!";
	$scope.isloaded = false;

	$log.info('Requesting EditProfile userId=[' + userId + ']');

	Profile.findByUserId(userId).then(function(userProfile) {
		$log.info('Loaded Profile! ' + userProfile.firstName);
		$scope.profile = _getProfile(userProfile);
		$log.info('Loaded Profile! ' + $scope.profile.teebox.color);
		$scope.hcps = [
           -5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,
           10,11,12,13,14,15,16,17,18,19,
           20,21,22,23,24,25,26,27,28,29,30,31,
           32,33,34,35,36
		];
		
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
		angular.forEach($scope.hcps, function(hcp) {
			if (hcp == $scope.profile.hcp && !found) {
				found = true;
				$scope.profile.hcp = hcp;
			}
		});
		
		found = false;
		angular.forEach($scope.teeboxes, function(teebox) {
			if (teebox.color.toLowerCase() == $scope.profile.teebox.color.toLowerCase() && !found) {
				found = true;
				$scope.profile.teebox = teebox;
			}
		});
		
		$scope.isloaded = true;
	});
	
	$scope.change = function() {
		if($scope.pwd1 == $scope.pwd2) {
			$scope.showPwdMatchError = false;
			var profile = _getProfile($scope.profile);
			Profile.updatePwd(rootRef, profile, $scope.pwd1).then(function(successMsg) {
				$scope.showMessage = true;
				$scope.message = successMsg;
			}, function(errMsg) {
				$scope.showMessage = true;
				$scope.message = errMsg;
			});
		} else {
			$scope.showPwdMatchError = true;
		}
	};

	$scope.cancel = function() {
		__back();
	};
	
	function _getProfile(userProfile) {
		var profile = {
			firstName : userProfile.firstName,
			lastName : userProfile.lastName,
			nickname : userProfile.nickname,
			uid : userProfile.uid,
			roles : userProfile.roles,
			email : userProfile.email,
			teebox : userProfile.teebox,
			hcp : parseInt(userProfile.hcp),
			ghin : userProfile.ghin,
			pw : userProfile.pw
		};

		return profile;
	}
	
	function __back() {
		$location.path('/', false);
	}
} ]);