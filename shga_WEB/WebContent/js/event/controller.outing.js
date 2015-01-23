 angular.module('shgaApp.controllers.Event').controller('OutingController', [ "$routeParams","$rootScope", "$scope", "$firebase", "$log", "$location", "Registration", "ShgaEvent", "Profile", "Golfer", function($routeParams, $rootScope, $scope, $firebase, $log, $location, Registration, ShgaEvent, Profile, Golfer) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	var eventId = $routeParams.eventId;
	$scope.isloaded = false;
	$scope.shgaEvent = {};
	$scope.isAuth = false;
	
	ShgaEvent.getEventById(eventId).then(function(shgaEvent) {
		$scope.shgaEvent = shgaEvent;
		var authData = rootRef.getAuth();
		if (authData) {
			$scope.isAuth = true;
		} else {
			$scope.isAuth = false;
		}
		$scope.isloaded = true;
	});

	var date_sort_asc = function(date1, date2) {
		if (date1 > date2)
			return 1;
		if (date1 < date2)
			return -1;
		return 0;
	};


	
	$scope.isUserInRole = function(role) {
		var userInRole = false;
		if ($scope.user.roles != null && $scope.user.roles.length > 1) {
			userInRole = true;
		}
		return userInRole;
	};

	$scope.formatTeeTimes = function(teeTimes) {
		var teeTimesArray = new Array();
		angular.forEach(teeTimes, function(teeTime) {
			teeTimesArray.push(moment(teeTime));
		});

		// Sort the times:
		teeTimesArray.sort(date_sort_asc);

		var teeTimesFormatted = "";
		for (var i = 0; i < teeTimesArray.length; i++) {
			var mDate = moment(teeTimesArray[i]).format("h:mm a");
			if (teeTimesFormatted.length > 0) {
				teeTimesFormatted = teeTimesFormatted + ", " + mDate;
			} else {
				teeTimesFormatted = mDate;
			}
		}

		return teeTimesFormatted;
	};

	$scope.formatDate = function(timestamp) {
		var mDate = moment(timestamp).format("ddd, MMM Do YYYY");
		// $log.info("mDate = " + mDate);
		return mDate;
	};

	$scope.deleteEvent = function(shgaEvent) {
		$location.path('/', false);
		ShgaEvent.remove(rootRef, shgaEvent);
	};

	$scope.isSignedUp = function(shgaEvent, userId) {
		var isSignedUp = false;
		angular.forEach(shgaEvent.golfers, function(golfer) {
			if (golfer.uid == userId && !isSignedUp) {
				isSignedUp = true;
			}
		});
		return isSignedUp;
	};

	$scope.signUp = function(shgaEvent, user) {
		var golfers = [];

		angular.forEach(shgaEvent.golfers, function(golfer) {
			golfers.push({
				uid : golfer.uid,
				firstName : golfer.firstName,
				lastName : golfer.lastName,
				hcp : golfer.hcp,
				teebox : golfer.teebox,
				email : golfer.email
			});
		});

		golfers.push({
			uid : user.uid,
			firstName : user.firstName,
			lastName : user.lastName,
			hcp : user.hcp,
			teebox : user.teebox,
			email : user.email
		});
		ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
	};

	$scope.dropOut = function(shgaEvent, userId) {
		var golfers = [];
		angular.forEach(shgaEvent.golfers, function(golfer) {
			if (golfer.uid != userId) {
				golfers.push({
					uid : golfer.uid,
					firstName : golfer.firstName,
					lastName : golfer.lastName,
					hcp : golfer.hcp,
					teebox : golfer.teebox,
					email : golfer.email
				});
			}
		});
		ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
	};

	$scope.cancel = function() {
		$location.path('/', false);
	};
	
	$scope.editProfile = function(shgaEvent, userId) {
		$location.path('/profile/' + userId + '/' + shgaEvent.eventId, false);
	};

	$scope.manageGolfers = function(shgaEvent) {
		$location.path('/golfers/' + shgaEvent.eventId, false);
	};
	
} ]);