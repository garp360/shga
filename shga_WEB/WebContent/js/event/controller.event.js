angular.module('shgaApp.controllers.Event', []).controller("EventController", ["$rootScope", "$scope", "$firebase", "$modal", "$log", "Registration", "ShgaEvent", "Profile", "Golfer", function($rootScope, $scope, $firebase, $modal, $log, Registration, ShgaEvent, Profile, Golfer) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.user = {};
	$scope.sec = {};
	$scope.registrant = {};
	$scope.shgaEvent = {};
	$scope.shgaEvents = ShgaEvent.getAllEvents();
	$scope.shgaGolfers = Golfer.getAllGolfers();
	
	
	
	$rootScope.$on("$routeChangeStart", function(){
	    $rootScope.loading = true;
	  });

	  $rootScope.$on("$routeChangeSuccess", function(){
	    $rootScope.loading = false;
	  });

	  var scrollItems = [];

	  for (var i=1; i<=100; i++) {
	    scrollItems.push("Item " + i);
	  }

	  $scope.scrollItems = scrollItems;
	  $scope.invoice = {payed: true};
	  
	  $scope.userAgent =  navigator.userAgent;
	  $scope.chatUsers = [
	    { name: "Carlos  Flowers", online: true },
	    { name: "Byron Taylor", online: true },
	    { name: "Jana  Terry", online: true },
	    { name: "Darryl  Stone", online: true },
	    { name: "Fannie  Carlson", online: true },
	    { name: "Holly Nguyen", online: true },
	    { name: "Bill  Chavez", online: true },
	    { name: "Veronica  Maxwell", online: true },
	    { name: "Jessica Webster", online: true },
	    { name: "Jackie  Barton", online: true },
	    { name: "Crystal Drake", online: false },
	    { name: "Milton  Dean", online: false },
	    { name: "Joann Johnston", online: false },
	    { name: "Cora  Vaughn", online: false },
	    { name: "Nina  Briggs", online: false },
	    { name: "Casey Turner", online: false },
	    { name: "Jimmie  Wilson", online: false },
	    { name: "Nathaniel Steele", online: false },
	    { name: "Aubrey  Cole", online: false },
	    { name: "Donnie  Summers", online: false },
	    { name: "Kate  Myers", online: false },
	    { name: "Priscilla Hawkins", online: false },
	    { name: "Joe Barker", online: false },
	    { name: "Lee Norman", online: false },
	    { name: "Ebony Rice", online: false }
	  ];




	rootRef.onAuth(function globalOnAuth(authData) {
		if (authData) {
			$scope.isAuth = true;
			$scope.user = Golfer.getGolferByUserId(authData.uid);
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
			Registration.authWithPassword(rootRef, {
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

	$scope.editProfile = function(userId) 
	{
		$log.info('Requesting EditProfile userId=[' + userId + ']');
		
		Profile.findByUserId(userId).then(function(userProfile) 
		{
			$log.info('Loaded Profile! ', userProfile, userProfile.teebox.color);
			var modalInstance = $modal.open(
			{
			    templateUrl : 'partial/shga-golfer-form.html',
			    controller : 'ProfileController',
			    size : 'lg',
			    backdrop : 'static',
			    resolve : 
			    {
			    	profile : function() 
			    	{
					    return userProfile;
				    }
			    }
			});

			modalInstance.result.then(function(profile) 
			{
				var allEvents = $scope.shgaEvents;
				Profile.update(rootRef, {
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
			Registration.createUser(rootRef, {
			    email : registrant.username,
			    password : registrant.password1
			}).then(function() {
				$log.info('User Created Successfully');
				$log.info('Logging in...');
				Registration.registerUser(rootRef, {
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
		ShgaEvent.remove(rootRef, shgaEvent);
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
		ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
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
		ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
	};

	$scope.createEvent = function() {
		var modalInstance = $modal.open({
		    templateUrl : 'partial/shga-event-form.html',
		    controller : 'ManageEventController',
		    size : 'sm',
		    backdrop : 'static',
		    resolve : {
			    shgaEvent : function() {
				    return $scope.shgaEvent;
			    }
		    }
		});

		modalInstance.result.then(function(shgaEvent) 
		{
			ShgaEvent.create(rootRef, shgaEvent);
			$log.info('Event Created Successfully');
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
			ShgaEvent.addGolfers(rootRef, shgaEvent, golfers);
		}, function(err) {
			$log.info('Managed Golfers Failed');
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
}]);