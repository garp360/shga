angular.module('shgaApp.controllers.Profile').controller("ImportController",['$scope', '$log', '$location', '$http', 'Profile', function($scope, $log, $location, $http, Profile) {

	$scope.import = function() {
		var f = document.getElementById('file').files[0], r = new FileReader();
		r.onloadend = function(e) {
			var gArray = [];
			$scope.$apply(function() {			
				var data = e.target.result;
				var uploadData = data.split(/\n/);
				angular.forEach(uploadData, function(value, key){
					if(key > 0) {
						var tmp = value.substring(0, value.length - 1);
						var tmpArray = tmp.split(/[ ,]+/);
						gArray.push({lastName : tmpArray[0],
							firstName: tmpArray[1],
							hcp: isNaN(tmpArray[2]) ? 99.0 : parseFloat(tmpArray[2]).toFixed(1),
							effectiveDate: tmpArray[3]});
					}
				});
				var copy = angular.copy(gArray);
				Profile.import(copy);
			});
		};
		r.readAsText(f);
	};
	
	$scope.cancel = function() {
		$location.path('/', false);
	};
}]);