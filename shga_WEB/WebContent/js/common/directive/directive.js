angular.module('shgaApp.directives', ['ngMessages'])

.directive("emailFormat", function($log) {
	return {	
		restrict: 'A',
		require: 'ngModel',
		
		link: function(scope, element, attributes, ngModel) {

			ngModel.$validators.emailFormat = function(modelValue) {  
				var isValid = true;
				var emailRegex = /.+@.+\..+/i;
				
				if(modelValue) {
					isValid = emailRegex.test(modelValue);
				}
				
				$log.debug("emailFormat :: " + isValid);
				return isValid;
            };
		}
	};
})

.directive('emailAvailability', function($q, $timeout, $log) {
	return {
		restrict : 'A',
		require : 'ngModel',

		link : function(scope, element, attributes, ngModel) {
			ngModel.$asyncValidators.emailAvailability = function(modelValue, viewValue) {
				$log.debug("emailAvailability  modelValue :: " + modelValue);
				if (ngModel.$isEmpty(modelValue)) {
					return $q.when(true);
				}

				var def = $q.defer();

				$timeout(function() {
					if (modelValue.indexOf("AAA") === -1) {
						def.resolve(true);
					} else {
						def.reject(false);
					}
				}, 2000);

				return def.promise;
			};
		}
	};
});