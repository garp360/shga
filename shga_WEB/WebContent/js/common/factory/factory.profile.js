angular.module('shgaApp.factory.Profile', []).factory('Profile', function($firebase, $q, $log) {
	
	var factory = {};
	
	factory.findByUserId =  function findByUserId(userId) {
		$log.info('Finding profile for User (userId=[' + userId + ']');
		var ref = new Firebase("https://shga.firebaseio.com/golfers/").child(userId);
		var sync = $firebase(ref).$asObject();
		
		
		return sync.$loaded();
	};
	
	factory.update = function update(rootRef, golfer, shgaEvents) {
		$log.info('Updating profile for ' + golfer.firstName + ' ' + golfer.lastName);
		var authData = rootRef.getAuth();
		
		if (golfer && authData) 
		{
			var profile = _getProfile(golfer);
			var eventGolfer = _getEventGolfer(golfer);
			var eventGolferId = golfer.uid;
			var futureEvents = _getFutureEventsForGolfer(shgaEvents, eventGolferId);

			rootRef.child('golfers').child(eventGolferId).set(angular.fromJson(profile));
			
			angular.forEach(futureEvents, function(shgaEvent) {
				var golfers = [];
				var eventId = shgaEvent.eventId;
				angular.forEach(shgaEvent.golfers, function(existingGolfer) {
					if (existingGolfer.uid != eventGolferId) {
						golfers.push(_getEventGolfer(existingGolfer));
					}
				});
				
				golfers.push(eventGolfer);
				var event = _getShgaEvent(shgaEvent, golfers);
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
			var eventGolferId = golfer.uid;
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
				rootRef.child('golfers').child(eventGolferId).set(angular.fromJson(profile));  
			    console.log("User password changed successfully!");
			    message = "User password changed successfully!";
			    deferred.resolve(message);
			  }
			});
		}
		return deferred.promise;
	};
	
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
	
	return factory;
});