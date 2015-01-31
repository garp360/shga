angular.module('shgaApp.controllers.Registration', []).controller('RegistrationController', function($scope, $log, $location, Registration) {
	var rootRef = new Firebase("https://shga.firebaseio.com");
	$scope.title = "SHGA Registration";
	$scope.teeboxes = [ 
       { color : 'Gold' }, 
       { color : 'Black' }, 
       { color : 'Blue' }, 
       { color : 'White' }, 
       { color : 'Green' }, 
       { color : 'Burgundy' }];
	
	$scope.hcps = [
       -5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,
       10,11,12,13,14,15,16,17,18,19,
       20,21,22,23,24,25,26,27,28,29,30,31,
       32,33,34,35,36
	];
	
	$scope.registrant = {
	    hcp : $scope.hcps[15],
	    teebox : $scope.teeboxes[1]
	};
	
	$scope.register = function() {
		$log.info('Begin register user...')
		Registration.createUser(rootRef, {
		    email : $scope.registrant.username,
		    password : $scope.registrant.password1
		}).then(function() {
			$log.info('User Created Successfully');
			$log.info('Logging in...');
			Registration.registerUser(rootRef, {
			    email : $scope.registrant.username,
			    password : $scope.registrant.password1
			}, $scope.registrant).then(function() {
				$log.info('User Logged In');
				$log.info('Switching routes...');
				$location.path('/', false);
			}, function(err) {
				$log.info('Registration Error: ' + err);
			});
		}, function(err) {
			$log.info('Registration Error: ' + err);
		});
	};
});