angular.module('scroll', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];

        var funCheckBounds = function(evt) {
            var rectObject = raw.getBoundingClientRect();
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                scope.$apply(attr.whenScrolled);
            }
        };
        angular.element(window).bind('scroll load', funCheckBounds);
    };
});
