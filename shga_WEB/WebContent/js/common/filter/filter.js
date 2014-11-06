angular.module('shgaApp.filters', []).filter('currentEvents', function() {

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