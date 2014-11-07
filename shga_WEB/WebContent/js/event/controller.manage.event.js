angular.module('shgaApp.controllers.Event').controller('ManageEventController', function($scope, $modalInstance, shgaEvent) {
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