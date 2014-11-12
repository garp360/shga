 angular.module('shgaApp.controllers.Event').controller('ManageEventGolfersController', [ "$scope", "$routeParams", "$location", "$log", "ShgaEvent", "Golfer", function($scope, $routeParams, $location, $log, ShgaEvent, Golfer) {
	 var rootRef = new Firebase("https://shga.firebaseio.com");
	 var eventId = $routeParams.eventId;
	$scope.shgaEvent = {};
	$scope.allGolfers = [];
	$scope.scheduledGolfers = [];
	$scope.availableGolfers = [];
	$scope.availableGolfersSelected = [];
	$scope.scheduledGolfersSelected = [];
	$scope.isloaded = false;

	ShgaEvent.getEventById(eventId).then(function(shgaEvent) {
		$scope.shgaEvent = shgaEvent;
		
		if(shgaEvent.golfers != null && shgaEvent.golfers.length > 0) 
		{
			$scope.scheduledGolfers = angular.copy(shgaEvent.golfers);
		}
		
		Golfer.getAllGolfers().then(function(allGolfers){
			$scope.allGolfers = allGolfers;
			
			filterForEvent();
			$scope.isloaded = true;
		});
	});

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
	};

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
	
	$scope.save = function() {
		var golfers = [];

		angular.forEach($scope.scheduledGolfers, function(golfer) {
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
		ShgaEvent.addGolfers(rootRef, $scope.shgaEvent, golfers);
		$location.path('/', false);
	};
} ]);