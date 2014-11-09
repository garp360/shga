angular.module('shgaApp.controllers.Profile', []).controller('ProfileController', [ "$scope", "$log", "$routeParams", "$location", "Profile", "ShgaEvent", function($scope, $log, $routeParams, $location, Profile, ShgaEvent) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	var userId = $routeParams.uid;
	$scope.shgaEvents = ShgaEvent.getAllEvents();
	$scope.profile = {};

	$log.info('Requesting EditProfile userId=[' + userId + ']');

	Profile.findByUserId(userId).then(function(userProfile) {
		$log.info('Loaded Profile! ' + userProfile.firstName);
		$scope.profile = _getProfile(userProfile);
		$log.info('Loaded Profile! ' + $scope.profile.teebox.color);

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
	});

	$scope.save = function() {
		$log.info('Requesting update to profile...');
		var profile = _getProfile($scope.profile);
		var allEvents = $scope.shgaEvents;
		Profile.update(rootRef, profile, allEvents);
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
			hcp : userProfile.hcp,
			ghin : userProfile.ghin,
			pw : userProfile.pw
		};

		return profile;
	}
} ]);