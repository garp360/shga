angular.module('shgaApp.factory.Event', []).factory('ShgaEvent', function($firebase, $q, $log) {
	
	var factory = {};
	
	factory.getAllEvents = function getAllEvents() {
		var ref = new Firebase("https://shga.firebaseio.com/events");
		var sync = $firebase(ref.limit(10));
		var eventsArray = sync.$asArray();

		return eventsArray;
	};
	
	factory.create = function create(rootRef, shgaEvent) {
		var authData = rootRef.getAuth();
		
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
	
	factory.addGolfers = function addGolfers(rootRef, shgaEvent, golfers) {
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
	
	factory.remove = function remove(rootRef, shgaEvent) {
		var authData = rootRef.getAuth();
		if (shgaEvent && authData) {
			var removeRef = new Firebase("https://shga.firebaseio.com/events/" + shgaEvent.eventId);
			removeRef.remove();
		}
	};
	
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
	
	function _convertToTimestamp(dateString) {
		var d = new Date(Date.parse(dateString));
		var n = d.toLocaleDateString();
		var t = new Date(Date.parse(n));
		var timestamp = t.getTime();

		return timestamp;
	};
	
	return factory;
});