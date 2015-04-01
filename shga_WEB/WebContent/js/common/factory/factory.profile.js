angular.module('shgaApp.factory.Profile', []).factory('Profile', function($firebase, $q, $log) {

	var factory = {};
	
	factory.findByUserId =  function findByUserId(userId) {
		$log.info('Finding profile for User (userId=[' + userId + ']');
		var ref = new Firebase("https://shga.firebaseio.com/golfers/").child(userId);
		var sync = $firebase(ref).$asObject();
		
		
		return sync.$loaded();
	};
	
	factory.import = function update(importGolfers) {
		var rootRef = new Firebase("https://shga.firebaseio.com");
		if (importGolfers) 
		{
			_updateFutureEventHandicaps(importGolfers);
			_getAllGolfers().then(function(allGolfers){
				angular.forEach(allGolfers, function(existingGolfer) {
					angular.forEach(importGolfers, function(importGolfer) {
						if(importGolfer.firstName === existingGolfer.firstName && 
								importGolfer.lastName === existingGolfer.lastName) {
							var tmpGolfer = _getProfile(existingGolfer);
							tmpGolfer.hcp = importGolfer.hcp;
							rootRef.child('golfers').child(tmpGolfer.uid).set(tmpGolfer);
						}
					});
				});
			});

		};
	};
	
	factory.update = function update(rootRef, golfer, shgaEvents) {
		//$log.info('Updating profile for ' + golfer.firstName + ' ' + golfer.lastName);
		//$log.info('shgaEvents ' + shgaEvents.length);
		var authData = rootRef.getAuth();
		
		if (golfer && authData) 
		{
			var profile = _getProfile(golfer);
			var eventGolfer = _getEventGolfer(golfer);
			var eventGolferId = golfer.uid;
			var futureEvents = _getFutureEventsForGolfer(shgaEvents, eventGolferId);
			$log.info('futureEvents ' + futureEvents.length);
			
			rootRef.child('golfers').child(eventGolferId).set(angular.fromJson(profile));
			
			angular.forEach(futureEvents, function(shgaEvent) {
				var golfers = [];
				var eventId = shgaEvent.eventId;
				angular.forEach(shgaEvent.golfers, function(existingGolfer) {
					if (existingGolfer.uid != eventGolferId) {
						golfers.push(_getEventGolfer(existingGolfer));
					}
				});
				$log.info('golfers size = ' + golfers.length);
				
				
				golfers.push(eventGolfer);
				var event = _getShgaEvent(shgaEvent, golfers);
				angular.forEach(event.golfers, function(existingGolfer) {
					$log.info('Event Golfer profile for ' + existingGolfer.firstName + ' ' + existingGolfer.lastName + ' hcp:' + existingGolfer.hcp );
				});
				
				rootRef.child('events').child(eventId).set(event);
			});
		};
	};
	
	
	factory.updatePwd = function pwUpdate(rootRef, golfer, pwd) {
		var authData = rootRef.getAuth();
		var deferred = $q.defer();
		var message = "Error changing password!";
		if (golfer && authData) 
		{
			var golferId = golfer.uid;
			var email = golfer.uid;
			var oldPwd = golfer.pw;
			var newPwd = pwd;
			
			rootRef.changePassword({
			  email: email,
			  oldPassword: oldPwd,
			  newPassword: newPwd
			}, function(error) {
			  if (error) {
			    switch (error.code) {
			      case "INVALID_PASSWORD":
			        console.log("The specified user account password is incorrect.");
			        message = "The specified user account password is incorrect.";
			        break;
			      case "INVALID_USER":
			        console.log("The specified user account does not exist.");
			        message = "The specified user account does not exist.";
			        break;
			      default:
			        console.log("Error changing password:", error);
			    }
			    deferred.reject(message);
			  } else {
				var profile = _getProfile(golfer);
				rootRef.child('golfers').child(golferId).set(angular.fromJson(profile));  
			    console.log("User password changed successfully!");
			    message = "User password changed successfully!";
			    deferred.resolve(message);
			  }
			});
		}
		return deferred.promise;
	};
	
	function _getAllGolfers() {
		var ref = new Firebase("https://shga.firebaseio.com/golfers");
		var sync = $firebase(ref);
		var golfersArray = sync.$asArray();

		return golfersArray.$loaded();
	}
	
	function _getShgaEvent(event, golfers) {
		var shgaEvent = {
		    eventId : event.eventId,
		    uid : event.uid,
		    timestamp : event.timestamp,
		    course : event.course,
		    teeTimes : event.teeTimes,
		    golfers : golfers,
		    group : event.group
		};
		
		return shgaEvent;
	}

	function _getProfile(golfer) {
		var profile = {
		    firstName : golfer.firstName,
		    lastName : golfer.lastName,
		    nickname : golfer.nickname,
		    uid : golfer.uid,
		    roles : golfer.roles,
		    email : golfer.email,
		    teebox : golfer.teebox,
		    hcp : golfer.hcp,
		    ghin : golfer.ghin,
		    pw : golfer.pw
		};
		
		return profile;
	}

	function _getEventGolfer(golfer) {
		var eventGolfer = {
			firstName : golfer.firstName,
		    lastName : golfer.lastName,
		    uid : golfer.uid,
		    email : golfer.email,
		    teebox : golfer.teebox,
		    hcp : golfer.hcp
		};
		
		return eventGolfer;
	}
	
	function _getFutureEventsForGolfer(shgaEvents, golferId) {
		var filteredList = [];
		var now = new Date();

		now = new Date(now.setHours(0, 0, 0, 0));

		var timestamp = now.getTime();

		for (var i = 0; i < shgaEvents.length; i++) 
		{
			if (shgaEvents[i].timestamp >= timestamp && _eventContainsGolfer(shgaEvents[i], golferId)) 
			{
				filteredList.push(shgaEvents[i]);
			}
		}

		return filteredList;
	};

	function _getAllFutureEvents(shgaEvents) {
		$log.info('futureEvents ' + shgaEvents.length);
		var filteredList = [];
		var now = new Date();
		
		now = new Date(now.setHours(0, 0, 0, 0));
		
		var timestamp = now.getTime();
		
		for (var i = 0; i < shgaEvents.length; i++) 
		{
			if (shgaEvents[i].timestamp >= timestamp) 
			{
				filteredList.push(shgaEvents[i]);
			}
		}
		
		return filteredList;
	};

	function _eventContainsGolfer(shgaEvent, golferId) {
		var found = false;
		for (var i = 0; i < shgaEvent.golfers.length; i++) {
			if (shgaEvent.golfers[i].uid == golferId && !found) {
				found = true;
				break;
			}
		}
		return found;
	};
	
	function _getAllEvents() {
		var ref = new Firebase("https://shga.firebaseio.com/events");
		var sync = $firebase(ref);
		var eventsArray = sync.$asArray();

		
		return eventsArray.$loaded();
	};
	
	function _updateFutureEventHandicaps(importedGolfers) {
		$log.info('importedGolfers ' + importedGolfers.length);
		var rootRef = new Firebase("https://shga.firebaseio.com");
		
		_getAllEvents().then(function(shgaEvents){
			var allFutureEvents = _getAllFutureEvents(shgaEvents);
			$log.info('allFutureEvents ' + allFutureEvents.length);
			angular.forEach(allFutureEvents, function(shgaEvent) { 
				var isUpdated = false;
				var event = angular.copy(shgaEvent);
				var eventId = event.eventId;
				$log.info('eventId ' + eventId);
				$log.info('event.golfers ' + event.golfers.length);
				angular.forEach(event.golfers, function(eventGolfer) {
					//$log.info('eventGolfer.uid ' + eventGolfer.uid);
					angular.forEach(importedGolfers, function(importedGolfer) {
						//$log.info('eventGolfer.uid ' + eventGolfer.uid + ' | importedGolfer.uid ' + importedGolfer.uid);
						if(eventGolfer.firstName === importedGolfer.firstName && 
								eventGolfer.lastName === importedGolfer.lastName) {
							//$log.info('Event Golfer profile for ' + eventGolfer.firstName + ' ' + eventGolfer.lastName + ' hcp:' + eventGolfer.hcp + ' to ' +  importedGolfer.hcp);
							eventGolfer.hcp = importedGolfer.hcp;
							isUpdated = true;
						}
					});
				});
				
				if(isUpdated) {
					$log.debug('Event ID = ' + eventId + ' ');
					var updatedEvent = {
						    eventId : event.eventId,
						    uid : event.uid,
						    timestamp : event.timestamp,
						    course : event.course,
						    teeTimes : event.teeTimes,
						    golfers : event.golfers,
						    group : event.group
						};
					rootRef.child('events').child(eventId).set(updatedEvent);
				}
			});
		});
		
	}
	
	return factory;
});
