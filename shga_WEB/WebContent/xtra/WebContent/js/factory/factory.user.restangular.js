angular.module('factory.module').factory('User', function( Restangular, $log ) {
	var factory = {};
	var userService = Restangular.service('users');
	var userUpdateService = Restangular.service('users/update');
	
	factory.getRestUrl = function() {
		return userService;
	};

	factory.findById = function(criteria) {
		return userService.one(criteria.id).get();
	};
	
	factory.search = function(criteria) {
		var users = Restangular.all('users').customGET("search", criteria);
		return users;
	};
	
	factory.remove = function(criteria) {
		var users = Restangular.all('users').customGET("delete", criteria);
		return users;
	};

	factory.update = function(userJson) {
		var u = userUpdateService.one(userJson.userId).get(userJson);
		return u;
	};

	factory.create = function(userJson) {
		var users = Restangular.all('users').customGET("create", userJson);
		return users;
	};

	factory.import = function(userJson) {
		
		var u = Restangular.all('users').customPOST(userJson, 'import', {}, {
			dataType: "json",
	        contentType:'application/x-www-form-urlencoded'
	    });
		return u;

	};
	
	return factory;
});