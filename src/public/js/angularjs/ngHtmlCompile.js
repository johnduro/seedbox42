angular.module('ngHtmlCompile', []).
    directive('ngHtmlCompile', function($compile, $rootScope) {
	return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {
		scope.$watch(attrs.ngHtmlCompile, function(newValue, oldValue) {
		    element.html(newValue);
		    $compile(element.contents())(scope);
		});
	    }
	}
    });