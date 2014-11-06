angular.module('shgaApp.factory.Golfer', []).factory('Golfer', function($firebase, $q, $log) {
	
	var factory = {};
	
	factory.getAllGolfers = function getAllGolfers() {
		var ref = new Firebase("https://shga.firebaseio.com/golfers");
		var sync = $firebase(ref);
		var golfersArray = sync.$asArray();

		return golfersArray;
	};

	factory.getGolferByUserId = function getGolferByUserId(userId) {
		var golferRef = new Firebase("https://shga.firebaseio.com/golfers/").child(userId);
		var golfer = $firebase(golferRef).$asObject();
		return golfer;
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