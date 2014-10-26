var app = angular.module("shgaApp", [ 'firebase', 'ui.bootstrap' ]);

app.config(function (datepickerConfig, datepickerPopupConfig) {
    datepickerConfig.showWeeks = false;
    datepickerPopupConfig.toggleWeeksText = null;
    datepickerPopupConfig.startingDay = 0;
  });


app.controller("EventController", function($scope, $firebase, $modal, $log, authProvider, shgaDataProvider) {
    var rootRef = new Firebase("https://shga.firebaseio.com");
    $scope.user = {};
    $scope.sec = {};
    $scope.registrant = {};
    $scope.shgaEvent = {};
    $scope.shgaEvents = shgaDataProvider.getEventData();
    
    rootRef.onAuth(function globalOnAuth(authData) {
        if (authData) {
            $scope.isAuth = true;
            $scope.user = shgaDataProvider.getGolferByUserId(authData.uid);
            
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
            authProvider.authWithPassword(rootRef, {
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
    
    $scope.register = function(size) {

        var modalInstance = $modal.open({
            templateUrl : 'myModalContent.html',
            controller : 'RegistrationController',
            size : size,
            backdrop : 'static',
            resolve : {
                registrant : function() {
                    return $scope.registrant;
                }
            }
        });

        modalInstance.result.then(function(registrant) {
        	$log.info('Registrant: ' + registrant);
            authProvider.createUser(rootRef, {
                email : registrant.username,
                password : registrant.password1
            }).then(function() { 
            		$log.info('User Created Successfully');
            		$log.info('Logging in...');
            		authProvider.registerUser(rootRef, {
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
    	$log.info("mDate = " + mDate);
    	return mDate;
    };
    
    $scope.createEvent = function(size) {
    	var modalInstance = $modal.open({
    		templateUrl : 'manageEventForm.html',
    		controller : 'ManageEventController',
    		size : size,
    		backdrop : 'static',
    		resolve : {
    			shgaEvent : function() {
    				return $scope.shgaEvent;
    			}
    		}
    	});
    	
    	modalInstance.result.then(function(shgaEvent) {
    		//$log.info('shgaEvent: ' + shgaEvent);
    		shgaDataProvider.createShgaEvent(rootRef, shgaEvent).then(function() { 
    			$log.info('Event Created Successfully');
    			$scope.shgaEvents = shgaDataProvider.getEventData();
    		}, function(err) {
    			$log.info('SHGA Event Error: ' + err);
    		});
    	}, function() {
    		$log.info('Modal dismissed at: ' + new Date());
    	});
    };
});

app.controller('RegistrationController', function($scope, $modalInstance, registrant) {
    $scope.title = "SHGA Registration";

    $scope.ok = function() {
        var sec = $scope.registrant;
        $modalInstance.close(sec);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('ManageEventController', function($scope, $modalInstance, shgaEvent) {
	$scope.groups = ['Saturday Group', 'Sunday Group'];
    $scope.group = $scope.groups[0];
    
    $scope.courses = ['South Hampton', 'Cimarrone', 'St. Johns'];
    $scope.course = $scope.courses[0];
    
    $scope.shgaEvent = {
    		group : $scope.groups[0],
    		course : $scope.courses[0]
    };
    
	$scope.ok = function() {
		var data = angular.copy($scope.shgaEvent);
		var jsonData = angular.toJson(data);
		//console.log("eventJson = " + jsonData.toString());
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

	  $scope.clear = function () {
		  $scope.shgaEvent.dt = null;
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

	  $scope.formats = ['EEE, MMMM dd, yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	  $scope.format = $scope.formats[0];
});

app.filter('currentEvents', function() {

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


app.factory('shgaDataProvider', function($firebase, $q) {
	var shgaDataService = {};
	
	shgaDataService.getEventData = function getEventData() {
		var ref = new Firebase("https://shga.firebaseio.com/events");
        var sync = $firebase(ref.limit(5));
        var eventsArray = sync.$asArray();

        return eventsArray;
    };

    shgaDataService.createShgaEvent = function createEvent(rootRef, shgaEvent) {
    	var authData = rootRef.getAuth();
    	//console.log("authData.uid :" + authData.uid);
    	//console.log("createEvent shgaEvent = " + shgaEvent);
    	
    	if(shgaEvent && authData) {
    		var objShgaEvent = angular.fromJson(shgaEvent);
    		var eventDate = objShgaEvent.dt;
    		var timestamp = _convertToTimestamp(eventDate);
    		var eventId = authData.uid + ":" + timestamp;
    		var event = {
    			eventId : eventId,
    			uid : authData.uid,
    			timestamp : timestamp,
    			course : objShgaEvent.course,
    			group : objShgaEvent.group
    		};
    		rootRef.child('events').child(eventId).set(angular.fromJson(event));
    	}
    };
    
    shgaDataService.getGolferByUserId = function setLoggedInAs(userId) {
        var golferRef = new Firebase("https://shga.firebaseio.com/golfers/" + userId);
        var golfer = $firebase(golferRef).$asObject();
        return golfer;
    };
    
    function _convertToTimestamp(dateString) {
    	console.log("dateString = " + dateString);
    	
    	var d = new Date(Date.parse(dateString));
    	console.log("d = " + d);
    	
    	var n = d.toLocaleDateString();
    	console.log("n = " + n);
    	
        var t = new Date(Date.parse(n));
        console.log("t = " + t);

        var timestamp = t.getTime();
    	console.log("timestamp = " + timestamp);
    	
    	return timestamp;
    };
    
    return shgaDataService;
});

app.factory('authProvider', function($firebase, $q) {
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
            	if(registrant) {
            		memberData = {
            			firstName : registrant.firstName,
                        lastName : registrant.lastName,
                        nickname : 'none',
                        uid : authData.uid,
                        roles : ['SHGA_USER','SHGA_ADMIN'],
                        email : registrant.username,
                        teebox : 'BLACK',
                        hcp : 10,
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
            };

            return deferred.promise;
        });
    };

    return authService;
});