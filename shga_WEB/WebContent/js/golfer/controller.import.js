angular.module('shgaApp.controllers.Profile').controller("ImportController",['$scope', '$log', '$controller','$location', '$http', 'Profile', function($scope, $log, $controller,$location, $http, Profile) {

	
	$scope.golfers = [];
	$scope.fileSelected = false;
	$scope.fileUpload;

	$scope.fileNameChanged= function(element, scope) {

	     $scope.$apply(function(scope) {
	    	 var file = element.files[0];
	    	 $scope.fileSelected = !(file == null);
	     });
	};
	
	$scope.import = function() {
		var file = document.getElementById('file').files[0];
		var date = moment(file.name.split("_")[1].substring(0,8), "YYYYMMDD").format("YYYYMMDD");
		var r = new FileReader();
		r.onloadend = function(file) {
			$scope.$apply(function() {			
				var data = file.target.result;
				PDFJS.getDocument( data ).then( function(pdf) 
				{
					var numPages = pdf.numPages;
					for(var i=1; i<=numPages; i++) 
					{
						pdf.getPage(i).then( function(page)
						{							
							page.getTextContent().then( function(textContent){
								var k = 0;
								while (k < textContent.items.length ){
									var block = textContent.items[k];
									var value = block.str;
									var isValid = typeof value === "string" &&
													value.indexOf("Name") < 0 && 
													value.indexOf("H.I.") < 0 && 
													value.indexOf("South Hampton") < 0 && 
													value.indexOf("Roster Report") < 0 && 
													value.indexOf("/") < 0 && 
													value.indexOf("Tj") < 0;
									if (isValid)
									{
										value = value.replace(/ /g,'');
										var nameArray = value.split(/[ ,]+/);
										k+=1;
										var hcpItem = textContent.items[k];
										if(hcpItem && hcpItem.str) {
											var hcp = hcpItem.str;
											hcp.replace(/[nNhHmMlL]/g, '').replace(/ /g,'');
											var multiplier = 1;
											if(hcp.indexOf("+") >= 0) {
												multiplier = -1;
											}
											hcp = hcp == '' ? null : hcp;
											$scope.golfers.push({lastName : nameArray[0],
												firstName: nameArray[1],
												hcp: hcp == null ? parseFloat("99.0").toFixed(1) : parseFloat(hcp).toFixed(1) * multiplier,
												effectiveDate: date});
										}
									}
									k++;
								}
								var copy = angular.copy($scope.golfers);
								Profile.import(copy);
								$location.url("/home");
							});
						});
					}
				});
			});
		};
		r.readAsArrayBuffer(file);
	};
	
	
	function formatNameLF(user) {
		return user.lastname + ", " + user.firstname;
	};
	
	function formatNameFL(user) {
		return user.firstname + " " + user.lastname;
	};
	
 	
	$scope.hcpFormat = function(hcp) {
		var h = parseFloat(hcp).toFixed(1);
		return h > 90 ? "NH" : h < 0 ? "+" + Math.abs(h) : h;
 	};

 	$scope.effectiveDateFormat = function(date) {
 		var effDate = moment(date);
 		return effDate.format("MMM Do, YYYY");
 	};
	
	//----------------------------------------------------------------------------------------------------------------
//	$scope.import = function() {
//		var f = document.getElementById('file').files[0], r = new FileReader();
//		r.onloadend = function(e) {
//			var gArray = [];
//			$scope.$apply(function() {			
//				var data = e.target.result;
//				var uploadData = data.split(/\n/);
//				angular.forEach(uploadData, function(value, key){
//					if(key > 0) {
//						var tmp = value.substring(0, value.length - 1);
//						var tmpArray = tmp.split(/[ ,]+/);
//						gArray.push({lastName : tmpArray[0],
//							firstName: tmpArray[1],
//							hcp: isNaN(tmpArray[2]) ? 99.0 : parseFloat(tmpArray[2]).toFixed(1),
//							effectiveDate: tmpArray[3]});
//					}
//				});
//				var copy = angular.copy(gArray);
//				Profile.import(copy);
//			});
//		};
//		r.readAsText(f);
//	};
	
	$scope.cancel = function() {
		$location.path('/', false);
	};
}]);