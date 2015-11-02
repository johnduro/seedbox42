app.directive('keyPress', keyPress);

function keyPress() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind("keypress", function(event) {
                var keyCode = event.which || event.keyCode;
                if (keyCode == $attrs.code) {
                    $scope.$apply(function() {
                        $scope.$eval($attrs.keyPress, {$event: event});
                    });

                }
            });
        }
    };
}

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);

            var modelSetter = model.assign;
            console.log(modelSetter);

            element.bind('change', function(){
                scope.$apply(function(){
                    console.log("isodfjiosdfj");
                    console.log(element[0].files[0]);
                    scope.$emit("fileSelected", { file: element[0].files[0] });
                    //modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive('errSrc', function() {
     return {
       link: function(scope, element, attrs) {
         element.bind('error', function() {
           if (attrs.src != attrs.errSrc) {
             attrs.$set('src', attrs.errSrc);
           }
         });
       }
     }
   });
