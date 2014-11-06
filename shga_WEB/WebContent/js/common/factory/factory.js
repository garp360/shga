angular.module('shgaApp.factories', ['shgaApp.factory.Profile']).factory('shgaDataProvider', function($firebase, $q) {
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
	};

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
}).factory('authProvider', function($firebase, $q) {
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