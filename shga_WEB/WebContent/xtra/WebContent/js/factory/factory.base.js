angular.module('factory.module').factory("BaseFactory", function( $q, $log ) {
	var USER_REF = "http://localhost:8129/restex/hello";
	
	var factory = {};	
	
	factory.userRef =  function() {
		return USER_REF;
	};
	
	return factory;
});