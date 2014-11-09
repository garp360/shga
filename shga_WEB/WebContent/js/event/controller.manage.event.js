angular.module('shgaApp.controllers.Event').controller('ManageEventController', [ "$scope", "$location", "ShgaEvent", function($scope, $location, ShgaEvent) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.hstep = 1;
	$scope.mstep = 1;
	$scope.teeTime = moment().hour(7).minute(36);

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

	var date_sort_asc = function(date1, date2) {
		if (date1 > date2)
			return 1;
		if (date1 < date2)
			return -1;
		return 0;
	};

	$scope.addTeeTime = function() {
		var exists = false;

		angular.forEach($scope.shgaEvent.teeTimes, function(tt) {
			if (moment(tt).format("h:mm a") == moment($scope.teeTime).format("h:mm a")) {
				exists = true;
			}
		});

		if (!exists) {
			$scope.shgaEvent.teeTimes.push(moment($scope.teeTime));
		}

		$scope.teeTime = moment($scope.teeTime).add(9, 'm');
	};

//	$scope.formatTeeTimes = function() {
//		var teeTimesFormatted = "";
//		var teeTimes = $scope.shgaEvent.teeTimes;
//
//		angular.forEach(teeTimes, function(teeTime) {
//			var mDate = moment(teeTime).format("h:mm a");
//			if (teeTimesFormatted.length > 0) {
//				teeTimesFormatted = teeTimesFormatted + ", " + mDate;
//			} else {
//				teeTimesFormatted = mDate;
//			}
//		});
//
//		return teeTimesFormatted;
//	};
	
	
	$scope.formatTeeTimes = function() {
		var teeTimes = $scope.shgaEvent.teeTimes;
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

	$scope.save = function() {
		ShgaEvent.create(rootRef, angular.toJson($scope.shgaEvent));
		$location.path('/', false);
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
} ]);