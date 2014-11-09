angular.module('shgaApp.controllers.Event', []).controller("EventController", [ "$rootScope", "$scope", "$firebase", "$modal", "$log", "$location", "Registration", "ShgaEvent", "Profile", "Golfer", function($rootScope, $scope, $firebase, $modal, $log, $location, Registration, ShgaEvent, Profile, Golfer) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.user = {};
	$scope.sec = {};
	$scope.registrant = {};
	$scope.shgaEvent = {};
	$scope.shgaEvents = ShgaEvent.getAllEvents();
	$scope.shgaGolfers = Golfer.getAllGolfers();

	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	});

	$rootScope.$on("$routeChangeSuccess", function() {
		$rootScope.loading = false;
	});

	var date_sort_asc = function(date1, date2) {
		if (date1 > date2)
			return 1;
		if (date1 < date2)
			return -1;
		return 0;
	};

	rootRef.onAuth(function globalOnAuth(authData) {
		if (authData) {
			$scope.isAuth = true;
			$scope.user = Golfer.getGolferByUserId(authData.uid);
		} else {
			$scope.isAuth = false;
			$scope.user = {};
		}
	});

	$scope.logout = function() {
		rootRef.unauth();
		$scope.sec = {};
		$scope.user = {};
		$location.path('/', false);
	};

	$scope.login = function(isValid) {
		if (isValid) {
			Registration.authWithPassword(rootRef, {
				email : $scope.sec.email,
				password : $scope.sec.password
			}).then(function(result) {
				$location.path('/', false);
			});
		}
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

	

	$scope.manageGolfers = function(shgaEvent) {
		var modalInstance = $modal.open({
			templateUrl : 'partial/shga-event-golfers-form.html',
			controller : 'ManageEventGolfersController',
			backdrop : 'static',
			size : 'lg',
			resolve : {
				shgaEvent : function() {
					return shgaEvent;
				},
				allGolfers : function() {
					return $scope.shgaGolfers;
				}
			}
		});

		modalInstance.result.then(function(scheduleGolfers) {
			var golfers = [];

			angular.forEach(scheduleGolfers, function(golfer) {
				golfers.push({
					uid : golfer.uid,
					firstName : golfer.firstName,
					lastName : golfer.lastName,
					hcp : golfer.hcp,
					teebox : golfer.teebox,
					email : golfer.email
				});
			});

			$log.info('Managed Golfers Successfully');
			ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
		}, function(err) {
			$log.info('Managed Golfers Failed');
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
} ]);