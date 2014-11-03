var app = angular.module("shgaApp", [ 'firebase', 'ui.bootstrap' ]);

app.config(function(datepickerConfig, datepickerPopupConfig) {
	datepickerConfig.showWeeks = false;
	datepickerPopupConfig.toggleWeeksText = null;
	datepickerPopupConfig.startingDay = 0;
});

app.controller("EventController", ["$scope", "$firebase", "$modal", "$log", "authProvider", "shgaDataProvider", "Profile", function($scope, $firebase, $modal, $log, authProvider, shgaDataProvider, Profile) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.user = {};
	$scope.sec = {};
	$scope.registrant = {};
	$scope.shgaEvent = {};
	$scope.shgaEvents = shgaDataProvider.getEventData();
	$scope.shgaGolfers = shgaDataProvider.getGolferData();

	rootRef.onAuth(function globalOnAuth(authData) {
		if (authData) {
			$scope.isAuth = true;
			$scope.user = shgaDataProvider.getGolferByUserId(authData.uid);
		} else {
			$scope.isAuth = false;
			$scope.user = {};
		}
	});

	$scope.logout = function() {
		rootRef.unauth();
		$scope.sec = {};
		$scope.user = {};
	};

	$scope.login = function(isValid) {
		if (isValid) {
			authProvider.authWithPassword(rootRef, {
			    email : $scope.sec.email,
			    password : $scope.sec.password
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

	$scope.editProfile = function(userId) {
		console.log('Requesting EditProfile userId=[' + userId + ']');
		
		Profile(userId).then(function(userProfile) {
			$scope.profile = userProfile;
			console.log("loaded Profile", $scope.profile, $scope.profile.teebox.color);
			console.log('Teebox : ' + $scope.profile.teebox.color);
		
		
		
		var modalInstance = $modal.open({
		    templateUrl : 'partial/shga-golfer-form.html',
		    controller : 'ProfileController',
		    size : 'lg',
		    backdrop : 'static',
		    resolve : {
		    	profile : function() {
				    return $scope.profile;
			    }
		    }
		});

		modalInstance.result.then(function(profile) {
			var allEvents = $scope.shgaEvents;
			shgaDataProvider.updateProfile(rootRef, {
			    firstName : profile.firstName,
			    lastName : profile.lastName,
			    nickname : profile.nickname,
			    uid : profile.uid,
			    roles : profile.roles,
			    email : profile.email,
			    teebox : profile.teebox,
			    hcp : profile.hcp,
			    ghin : profile.ghin,
			    pw : profile.pw
			}, allEvents);
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
		
		
		});
	};

	$scope.register = function(size) {

		var modalInstance = $modal.open({
		    templateUrl : 'partial/shga-registration-form.html',
		    controller : 'RegistrationController',
		    size : size,
		    backdrop : 'static'
		});

		modalInstance.result.then(function(registrant) {
			authProvider.createUser(rootRef, {
			    email : registrant.username,
			    password : registrant.password1
			}).then(function() {
				$log.info('User Created Successfully');
				$log.info('Logging in...');
				authProvider.registerUser(rootRef, {
				    email : registrant.username,
				    password : registrant.password1
				}, registrant);
			}, function(err) {
				$log.info('Registration Error: ' + err);
			});
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.formatDate = function(timestamp) {
		var mDate = moment(timestamp).format("dddd, MMMM Do YYYY");
		// $log.info("mDate = " + mDate);
		return mDate;
	};

	$scope.deleteEvent = function(shgaEvent) {
		shgaDataProvider.deleteShgaEvent(rootRef, shgaEvent);
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
		shgaDataProvider.addGolfers(rootRef, shgaEvent, golfers);
		// $scope.shgaEvents = shgaDataProvider.getEventData();
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
		shgaDataProvider.addGolfers(rootRef, shgaEvent, golfers);
		// $scope.shgaEvents = shgaDataProvider.getEventData();
	};

	$scope.createEvent = function(size) {
		var modalInstance = $modal.open({
		    templateUrl : 'partial/shga-event-form.html',
		    controller : 'ManageEventController',
		    size : size,
		    backdrop : 'static',
		    resolve : {
			    shgaEvent : function() {
				    return $scope.shgaEvent;
			    }
		    }
		});

		modalInstance.result.then(function(shgaEvent) {
			// $log.info('shgaEvent: ' + shgaEvent);
			shgaDataProvider.createShgaEvent(rootRef, shgaEvent);
			$log.info('Event Created Successfully');
			// $scope.shgaEvents = shgaDataProvider.getEventData();
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
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
			shgaDataProvider.addGolfers(rootRef, shgaEvent, golfers);
		}, function(err) {
			$log.info('Managed Golfers Failed');
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
}]);

app.controller('ProfileController', [ "$scope", "$modalInstance", "profile", function($scope, $modalInstance, profile) {
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

app.controller('RegistrationController', function($scope, $modalInstance) {
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

app.controller('ManageEventController', function($scope, $modalInstance, shgaEvent) {
	$scope.hstep = 1;
	$scope.mstep = 1;
	$scope.teeTime = moment(shgaEvent.dt).hour(7).minute(36);

	$scope.golfGroups = [ {
	    name : 'Saturday Group',
	    organizer : 'mikepulver@aol.com'
	}, {
	    name : 'Sunday Group',
	    organizer : 'garth.pidcock@gmail.com'
	} ];
	$scope.golfGroup = $scope.golfGroups[0];

	$scope.courses = [ {
	    name : 'South Hampton',
	    tees : [ 'Green', 'White', 'Blue', 'Black', 'Gold' ]
	}, {
	    name : 'Cimarrone',
	    tees : [ 'Red', 'White', 'Blue', 'Black' ]
	}, {
	    name : 'St. Johns',
	    tees : [ 'Red', 'White', 'Blue' ]
	}, ];

	$scope.shgaEvent = {
	    group : $scope.golfGroups[0],
	    course : $scope.courses[0],
	    teeTimes : []
	};

	$scope.addTeeTime = function(teeTime) {
		var exists = false;

		angular.forEach($scope.shgaEvent.teeTimes, function(tt) {
			if (moment(tt).format("h:mm a") == moment(teeTime).format("h:mm a")) {
				exists = true;
			}
		});

		if (!exists) {
			var arrayCopy = angular.copy($scope.shgaEvent.teeTimes);
			arrayCopy.push(teeTime);
			arrayCopy.sort(function sortDate(a, b) {
				return moment(b).subtract(moment(a));
			});
			$scope.shgaEvent.teeTimes = arrayCopy;
		}

		$scope.teeTime = moment(teeTime).add(9, 'm');
	};

	$scope.formatTeeTimes = function() {
		var teeTimesFormatted = "";
		var teeTimes = $scope.shgaEvent.teeTimes;

		angular.forEach(teeTimes, function(teeTime) {
			var mDate = moment(teeTime).format("h:mm a");
			if (teeTimesFormatted.length > 0) {
				teeTimesFormatted = teeTimesFormatted + ", " + mDate;
			} else {
				teeTimesFormatted = mDate;
			}
		});

		return teeTimesFormatted;
	};

	$scope.ok = function() {
		var data = angular.copy($scope.shgaEvent);
		var jsonData = angular.toJson(data);
		// console.log("eventJson = " + jsonData.toString());
		$scope.shgaEvent = {};
		$modalInstance.close(jsonData);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.today = function() {
		$scope.shgaEvent.dt = new Date();
	};
	$scope.today();

	$scope.clear = function() {
		$scope.shgaEvent.dt = null;
		$scope.teeTime = null;
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};

	$scope.toggleMin();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.formats = [ 'EEE, MMMM dd, yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate' ];
	$scope.format = $scope.formats[0];
});

app.controller('ManageEventGolfersController', [ "$scope", "$modalInstance", "shgaEvent", "allGolfers", function($scope, $modalInstance, shgaEvent, allGolfers) {
	$scope.shgaEvent = shgaEvent;
	$scope.allGolfers = allGolfers;
	$scope.scheduledGolfers = angular.copy(shgaEvent.golfers);
	$scope.availableGolfers = [];
	$scope.availableGolfersSelected = [];
	$scope.scheduledGolfersSelected = [];

	filterForEvent();

	$scope.addGolfer = function(isAll) {
		var scheduled = [];

		if (isAll) {
			angular.forEach($scope.availableGolfers, function(availableGolfer) {
				scheduled.push(availableGolfer);
			});
		} else {
			angular.forEach($scope.availableGolfersSelected, function(availableGolfer) {
				scheduled.push(availableGolfer);
			});
		}

		angular.forEach($scope.scheduledGolfers, function(scheduledGolfers) {
			scheduled.push(scheduledGolfers);
		});

		$scope.scheduledGolfers = scheduled;
		filterForEvent();
	};

	$scope.removeGolfer = function(isAll) {
		var scheduled = $scope.scheduledGolfers;

		if (isAll) {
			scheduled = [];
		} else {
			angular.forEach($scope.scheduledGolfersSelected, function(scheduledGolfer, key) {
				for (var i = scheduled.length - 1; i >= 0; i--) {
					if (scheduled[i].uid == scheduledGolfer.uid) {
						scheduled.splice(i, 1);
					}
				}
			});
		}

		$scope.scheduledGolfers = scheduled;
		filterForEvent();
	};

	$scope.formatDate = function(timestamp) {
		var mDate = moment(timestamp).format("dddd, MMMM Do YYYY");
		return mDate;
	};

	function filterForEvent() {
		$scope.availableGolfers = [];

		angular.forEach($scope.allGolfers, function(golfer) {
			if (!containsGolfer(golfer.uid)) {
				$scope.availableGolfers.push(golfer);
			}
		});
	}
	;

	function containsGolfer(golferId) {
		var found = false;
		for (var i = 0; i < $scope.scheduledGolfers.length; i++) {
			if ($scope.scheduledGolfers[i].uid == golferId && !found) {
				found = true;
				break;
			}
		}
		return found;
	}

	$scope.ok = function() {
		$modalInstance.close($scope.scheduledGolfers);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
} ]);

app.filter('currentEvents', function() {

	return function(shgaEvents) {
		var filteredList = [];
		var now = new Date();

		now = new Date(now.setHours(0, 0, 0, 0));

		var timestamp = now.getTime();

		for (var i = 0; i < shgaEvents.length; i++) {
			if (shgaEvents[i].timestamp >= timestamp) {
				filteredList.push(shgaEvents[i]);
			}
		}

		return filteredList;
	};

});

app.factory('shgaDataProvider', function($firebase, $q) {
	var shgaDataService = {};

	shgaDataService.getEventData = function getEventData() {
		var ref = new Firebase("https://shga.firebaseio.com/events");
		var sync = $firebase(ref.limit(10));
		var eventsArray = sync.$asArray();

		return eventsArray;
	};

	shgaDataService.getGolferData = function getGolferData() {
		var ref = new Firebase("https://shga.firebaseio.com/golfers");
		var sync = $firebase(ref);
		var golfersArray = sync.$asArray();

		return golfersArray;
	};

	function _getFutureEvents(shgaEvents) {
		var filteredList = [];
		var now = new Date();

		now = new Date(now.setHours(0, 0, 0, 0));

		var timestamp = now.getTime();

		for (var i = 0; i < shgaEvents.length; i++) {
			if (shgaEvents[i].timestamp >= timestamp) {
				filteredList.push(shgaEvents[i]);
			}
		}

		return filteredList;
	}
	;

	shgaDataService.updateProfile = function updateProfile(rootRef, golfer, shgaEvents) {
		var authData = rootRef.getAuth();
		if (golfer && authData) {
			var objGolfer = angular.fromJson(golfer);
			var golferId = objGolfer.uid;
			var memberData = {
			    firstName : objGolfer.firstName,
			    lastName : objGolfer.lastName,
			    nickname : objGolfer.nickname,
			    uid : objGolfer.uid,
			    roles : objGolfer.roles,
			    email : objGolfer.email,
			    teebox : objGolfer.teebox,
			    hcp : objGolfer.hcp,
			    ghin : objGolfer.ghin,
			    pw : objGolfer.pw
			};
			rootRef.child('golfers').child(golferId).set(angular.fromJson(memberData));
			var futureEvents = _getFutureEvents(shgaEvents);
			angular.forEach(futureEvents, function(shgaEvent) {
				var golfers = [];
				var eventId = shgaEvent.eventId;
				angular.forEach(shgaEvent.golfers, function(existingGolfer) {
					if (existingGolfer.uid != golferId) {
						// console.log("adding: " + existingGolfer.firstName);
						golfers.push({
						    firstName : existingGolfer.firstName,
						    lastName : existingGolfer.lastName,
						    uid : existingGolfer.uid,
						    email : existingGolfer.email,
						    teebox : existingGolfer.teebox,
						    hcp : existingGolfer.hcp
						});
					}
				});
				// console.log("adding: " + memberData.firstName);
				golfers.push({
				    firstName : memberData.firstName,
				    lastName : memberData.lastName,
				    uid : memberData.uid,
				    email : memberData.email,
				    teebox : memberData.teebox,
				    hcp : memberData.hcp
				});
				var event = {
				    eventId : shgaEvent.eventId,
				    uid : shgaEvent.uid,
				    timestamp : shgaEvent.timestamp,
				    course : shgaEvent.course,
				    teeTimes : shgaEvent.teeTimes,
				    golfers : golfers,
				    group : shgaEvent.group
				};

				rootRef.child('events').child(eventId).set(event);
			});
		}
	};

	shgaDataService.createShgaEvent = function createEvent(rootRef, shgaEvent) {
		var authData = rootRef.getAuth();
		// console.log("authData.uid :" + authData.uid);
		// console.log("createEvent shgaEvent = " + shgaEvent);

		if (shgaEvent && authData) {
			var objShgaEvent = angular.fromJson(shgaEvent);
			var eventDate = objShgaEvent.dt;
			var timestamp = _convertToTimestamp(eventDate);
			var eventId = authData.uid + ":" + timestamp;
			var event = {
			    eventId : eventId,
			    uid : authData.uid,
			    timestamp : timestamp,
			    course : objShgaEvent.course,
			    teeTimes : objShgaEvent.teeTimes,
			    golfers : [],
			    group : objShgaEvent.group
			};
			rootRef.child('events').child(eventId).set(angular.fromJson(event));
		}
	};

	shgaDataService.addGolfers = function addGolfers(rootRef, shgaEvent, golfers) {
		var authData = rootRef.getAuth();

		if (shgaEvent && authData) {
			var objShgaEvent = angular.fromJson(shgaEvent);
			var eventId = objShgaEvent.eventId;
			var event = {
			    eventId : eventId,
			    uid : shgaEvent.uid,
			    timestamp : shgaEvent.timestamp,
			    course : objShgaEvent.course,
			    teeTimes : objShgaEvent.teeTimes,
			    golfers : golfers,
			    group : objShgaEvent.group
			};
			rootRef.child('events').child(eventId).set(angular.fromJson(event));
		}
	};

	shgaDataService.deleteShgaEvent = function deleteShgaEvent(rootRef, shgaEvent) {
		var authData = rootRef.getAuth();
		if (shgaEvent && authData) {
			var removeRef = new Firebase("https://shga.firebaseio.com/events/" + shgaEvent.eventId);
			removeRef.remove();
		}
	};

	shgaDataService.getGolferByUserId = function getGolferByUserId(userId) {
		var golferRef = new Firebase("https://shga.firebaseio.com/golfers/").child(userId);
		var golfer = $firebase(golferRef).$asObject();
		return golfer;
	};

	function _convertToTimestamp(dateString) {
		var d = new Date(Date.parse(dateString));
		var n = d.toLocaleDateString();
		var t = new Date(Date.parse(n));
		var timestamp = t.getTime();

		return timestamp;
	}
	;

	return shgaDataService;
});

// a factory to create a re-usable profile object
// we pass in a userid and get back their synchronized data
app.factory("Profile", [ "$firebase", function($firebase) {
	return function(userId) {
		console.log("Finding profile for User (userId=[" + userId + "]");
		// create a reference to the user's profile
		var ref = new Firebase("https://shga.firebaseio.com/golfers/").child(userId);

		return $firebase(ref).$asObject().$loaded();
	};
} ]);

app.factory('authProvider', function($firebase, $q) {
	var authService = {};

	authService.getAuthRef = function() {
		return new Firebase("https://shga.firebaseio.com");
	};

	authService.createUser = function createUser(rootRef, userObj) {
		var deferred = $q.defer();
		rootRef.createUser(userObj, function(err) {
			if (!err) {
				deferred.resolve();
			} else {
				deferred.reject(err);
			}
		});

		return deferred.promise;
	};

	authService.registerUser = function registerUser(rootRef, userObj, registrant) {
		var deferred = $q.defer();
		rootRef.authWithPassword(userObj, function onAuth(err, authData) {
			if (err) {
				deferred.reject(err);
			} else if (authData) {
				rootRef.child('users').child(authData.uid).set(authData);
				var memberData = {};
				if (registrant) {
					memberData = {
					    firstName : registrant.firstName,
					    lastName : registrant.lastName,
					    nickname : 'none',
					    uid : authData.uid,
					    roles : [ 'SHGA_USER' ],
					    email : registrant.username,
					    teebox : registrant.teebox,
					    hcp : registrant.hcp,
					    ghin : '0000000000',
					    pw : registrant.password1
					};
					rootRef.child('golfers').child(authData.uid).set(memberData);
				}
				deferred.resolve(authData);
			}
		});

		return deferred.promise;
	};

	authService.authWithPassword = function authWithPassword(rootRef, userObj) {
		var deferred = $q.defer();

		rootRef.authWithPassword(userObj, function onAuth(err, authData) {
			if (err) {
				deferred.reject(err);
			} else if (authData) {
				deferred.resolve(authData);
			}
			;

			return deferred.promise;
		});
	};

	return authService;
});