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
.directive("onlyDigits", function ()
{
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope:{
            allowDecimal: '@',
            allowNegative: '@',
            minNum: '@',
            maxNum: '@'
        },

        link: function (scope, element, attrs, ngModel)
        {
            if (!ngModel) return;
            ngModel.$parsers.unshift(function (inputValue)
            {
                var decimalFound = false;
                var digits = inputValue.split('').filter(function (s,i)
                {
                    var b = (!isNaN(s) && s != ' ');
                    if (!b && attrs.allowDecimal && attrs.allowDecimal == "true")
                    {
                        if (s == "." && decimalFound == false)
                        {
                            decimalFound = true;
                            b = true;
                        }
                    }
                    if (!b && attrs.allowNegative && attrs.allowNegative == "true")
                    {
                        b = (s == '-' && i == 0);
                    }

                    return b;
                }).join('');
                if (attrs.maxNum && !isNaN(attrs.maxNum) && parseFloat(digits) > parseFloat(attrs.maxNum))
                {
                    digits = attrs.maxNum;
                }
                if (attrs.minNum && !isNaN(attrs.minNum) && parseFloat(digits) < parseFloat(attrs.minNum))
                {
                    digits = attrs.minNum;
                }
                ngModel.$viewValue = digits;
                ngModel.$render();

                return digits;
            });
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