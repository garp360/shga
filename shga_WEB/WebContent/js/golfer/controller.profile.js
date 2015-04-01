angular.module('shgaApp.controllers.Profile', []).controller('ProfileController', [ "$scope", "$log", "$routeParams", "$location", "Profile", "ShgaEvent", function($scope, $log, $routeParams, $location, Profile, ShgaEvent) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	var userId = $routeParams.uid;
	var eventId = $routeParams.eventId;
	$scope.shgaEvents = ShgaEvent.getAllEvents();
	$scope.profile = {};
	$scope.isloaded = false;
	$scope.handicap = {};

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
		$scope.decimals = [0,1,2,3,4,5,6,7,8,9];
		
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
		var i = parseInt($scope.profile.hcp.toString().split(".")[0]);
		var d = parseInt($scope.profile.hcp.toString().split(".")[1]);
		$log.debug("integer = " + i);
		$log.debug("decimal = " + d);

		angular.forEach($scope.hcps, function(hcp) {
			if (hcp === i && !found) {
				found = true;
				$scope.handicap.integer = hcp;
				$log.debug("integer = " + hcp);
			}
		});
		var found = false;
		angular.forEach($scope.decimals, function(decimal) {
			if (decimal === d && !found) {
				found = true;
				$scope.handicap.decimal = decimal;
				$log.debug("decimal = " + d);
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
	
	$scope.save = function() {
		$log.info('Requesting update to profile...');
		var profile = _getProfile($scope.profile);
		profile.hcp = parseFloat($scope.handicap.integer + "." + $scope.handicap.decimal);
		var allEvents = $scope.shgaEvents;
		Profile.update(rootRef, profile, allEvents);
		__back();
	};

	$scope.cancel = function() {
		__back();
	};
	
	function _getProfile(userProfile) {
		$log.info('Building profile json! ' + $scope.profile.firstName);
		var profile = {
			firstName : userProfile.firstName,
			lastName : userProfile.lastName,
			nickname : userProfile.nickname,
			uid : userProfile.uid,
			roles : userProfile.roles,
			email : userProfile.email,
			teebox : userProfile.teebox,
			hcp : parseFloat(userProfile.hcp.split(".")[0] + "." + userProfile.hcp.split(".")[1]),
			ghin : userProfile.ghin,
			pw : userProfile.pw
		};

		return profile;
	}
	
	function __back() {
		if(eventId) {
			$location.path('/outing/' + eventId, false);
		} else {
			$location.path('/', false);
		}
	}
} ]);