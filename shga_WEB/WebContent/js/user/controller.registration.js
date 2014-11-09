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
	
	$scope.registrant = {
	    hcp : 10.0,
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