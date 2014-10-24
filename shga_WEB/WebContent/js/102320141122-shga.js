var app = angular.module("shgaApp", [ "firebase", 'ui.bootstrap' ]);

app.controller("EventController", [ '$scope', '$http', '$modal', '$log','authProvider', function($scope, $firebase, $modal, $log,
		authProvider) {
	$scope.brand = "SHGA";
	$scope.isAuth = false;
	$scope.sec = {};
	$scope.shgaEvents = [];
	$scope.login = function(isValid) {

		if (isValid) {
			var isAuthorized = authProvider.isAuthorized({
				email : $scope.sec.email,
				password : $scope.sec.password
			}).then(
					function(isAuth) {
						$scope.isAuth = isAuth;
						if (isAuth) {
							var ref = new Firebase(
									"https://shga.firebaseio.com/events");
							var sync = $firebase(ref.limit(5));
							var eventsArray = sync.$asArray();
							$scope.shgaEvents = eventsArray;
						}
					});
		}

	};

	$scope.logout = function() {
		$scope.sec = {};
		$scope.isAuth = false;
	};

	$scope.showRegistrationForm  = function ( ) {
		var registrationData = angular.copy($scope.sec);
		var modalInstance = $modal.open( {
              templateUrl: 'registrationForm.html',
              controller: RegistrationModalDialogCtrl,
              resolve: {
            	  registrant: function () {
                      return registrationData;
                  }
              }});
		
		modalInstance.result.then(function (secData) {
		     alert(secData);
		}, function () {
		     $log.info('Modal dismissed at: ' + new Date());
		});

	};

}]);


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

app.factory('authProvider', function($firebase, $q) {
	var authService = {};
	authService.isAuthorized = function(authWithPassword) {
		var authRef = new Firebase("https://shga.firebaseio.com");
		var deferred = $q.defer();

		authRef.authWithPassword(authWithPassword, function(error, authData) {
			if (error === null) {
				console.log("User ID: " + authData.uid + ", Provider: "
						+ authData.provider);
				deferred.resolve(true);
			} else {
				console.log("Error authenticating user:", error);
				deferred.resolve(false);
			}
		});
		return deferred.promise;
	};
	return authService;
});

// app.directive('hbModalForm', function() {
// return {
// restrict : 'E',
// transclude : true,
// scope : {
// 'close' : '&onClose'
// },
// templateUrl : 'template/form-dialog.html'
// };
// });

var RegistrationModalDialogCtrl = function($scope, $modalInstance, registrant) {

	$scope.registrant = {};

	$scope.register = function() {
		$modalInstance.close($scope.registrant);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
};
