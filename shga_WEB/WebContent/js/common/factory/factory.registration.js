angular.module('shgaApp.factory.Registration', []).factory('Registration', function($firebase, $q, $log) {
	
	var factory = {};

	factory.getAuthRef = function() {
		return new Firebase("https://shga.firebaseio.com");
	};

	factory.createUser = function createUser(rootRef, userObj) {
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

	factory.registerUser = function registerUser(rootRef, userObj, registrant) {
		var deferred = $q.defer();
		rootRef.authWithPassword(userObj, function onAuth(err, authData) {
			if (err) {
				deferred.reject(err);
			} else if (authData) {
				rootRef.child('users').child(authData.uid).set(authData);
				var memberData = {};
				if (registrant) {
					memberData = {
					    firstName : registrant.firstName,
					    lastName : registrant.lastName,
					    nickname : 'none',
					    uid : authData.uid,
					    roles : [ 'SHGA_USER' ],
					    email : registrant.username,
					    teebox : registrant.teebox,
					    hcp : registrant.hcp,
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

	factory.authWithPassword = function authWithPassword(rootRef, userObj) {
		var deferred = $q.defer();

		rootRef.authWithPassword(userObj, function onAuth(err, authData) {
			if (err) {
				deferred.reject(err);
			} else if (authData) {
				deferred.resolve(authData);
			}
		});
		return deferred.promise;
	};
	
	factory.resetPassword = function resetPassword(rootRef, userObject)
	{
		var deferred = $q.defer();
		rootRef.resetPassword(
			userObject
		, function(error) 
		{
			var errorMsg = "Error resetting password";
			if (error) 
			{
				switch (error.code) 
				{
					case "INVALID_USER":
						errorMsg = "The specified user account does not exist.";
						break;
					default:
						errorMsg = "Error resetting password";
				}
				
				console.log(errorMsg);
				deferred.reject(errorMsg);
			} 
			else 
			{
				console.log("Password reset email sent successfully!");
				deferred.resolve("Password reset email sent successfully!  Check your email for instructions on how to change your password.");
			}
		});
		return deferred.promise;
	};

	return factory;
});