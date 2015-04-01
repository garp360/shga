angular.module('controller.module').controller("ImportController",['$scope', '$log', '$http', 'User', function($scope, $log, $http, User) {
	angular.extend(this, new BaseController($scope));
	$scope.controllerName = "ImportController";
	$scope.golfers = [];

	$scope.add = function() {
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
						gArray.push({lastname : tmpArray[0],
							firstname: tmpArray[1],
							hcp: isNaN(tmpArray[2]) ? 99.0 : parseFloat(tmpArray[2]).toFixed(1),
							effectiveDate: tmpArray[3]});
					}
				});
				$scope.golfers = gArray;
			});
		};
		r.readAsText(f);
	};
	
	$scope.update = function() {
		var copy = angular.copy($scope.golfers);
		User.import(copy);
	};
}]);