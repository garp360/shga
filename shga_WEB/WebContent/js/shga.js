var app = angular.module('shgaApp', [ 'firebase', 'ui.bootstrap', 'shgaApp.factories', 'shgaApp.filters', 'shgaApp.controllers' ]);

app.config(function(datepickerConfig, datepickerPopupConfig) {
	datepickerConfig.showWeeks = false;
	datepickerPopupConfig.toggleWeeksText = null;
	datepickerPopupConfig.startingDay = 0;
});