function BaseController ($scope, Lookup) {
	
	this.formatNameLF = function(user) {
		return user.lastname + ", " + user.firstname;
	};
	
	this.formatNameFL = function(user) {
		return user.firstname + " " + user.lastname;
	};
	
	$scope.formatControllerName = function(ctrlName) {
		return ("controllers." + ctrlName + ".js");
	};
};