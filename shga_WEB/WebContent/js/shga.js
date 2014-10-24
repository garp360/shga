var app = angular.module("shgaApp", [ 'firebase', 'ui.bootstrap' ]);

app.controller("EventController", function($scope, $firebase, $modal, $log, authProvider, shgaDataProvider) {
    var rootRef = new Firebase("https://shga.firebaseio.com");
    $scope.user = {};
    $scope.sec = {};
    $scope.registrant = {};
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
    
    shgaDataService.getGolferByUserId = function setLoggedInAs(userId) {
        var golferRef = new Firebase("https://shga.firebaseio.com/golfers/" + userId);
        var golfer = $firebase(golferRef).$asObject();
        return golfer;
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
                        roles : ['SHGA_USER'],
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