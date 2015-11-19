var app = angular.module('seedApp', [
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'ngCookies',
    'ngVideo',
    'ngFileUpload',
    'bootstrapLightbox',
    'angular.morris-chart',
    'luegg.directives',
    'chart.js',
    'com.2fdevs.videogular'
]);

// ---------------------- variable global -------------------------------
var api = "";

app.run(function ($rootScope, $location, $http, $state, $location) {

    api = "/";

    $rootScope.tools = {
        convertSize: function (aSize){
            if (aSize < 1)
                return "0 octets";
            aSize = Math.abs(parseInt(aSize, 10));
            var def = [[1, 'octets'], [1024, 'ko'], [1024 * 1024, 'Mo'], [1024 * 1024 * 1024, 'Go'], [1024 * 1024 * 1024 * 1024, 'To']];
            for(var i = 0; i < def.length; i++){
                if(aSize < def[i][0])
                return (aSize / def[i-1][0]).toFixed(2) + ' ' + def[i-1][1];
            }
        },
        convertFields: function(list){
            angular.forEach(list, function(value, key){
                res = value.fileType.split("/");
                value.type = res[0];
                value.sizeConvert = $rootScope.tools.convertSize(value.size);
            });
        },
        backPage: function(){
            if ($rootScope.states.from.name != "")
                $state.go($rootScope.states.from.name);
        }
    };

    // gestion des droits d'access aux url
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

        $rootScope.states = {
            to: toState,
            from: fromState
        };

        if ("access" in toState){
            for (var key in toState.access){
                if (key == $rootScope.user.role){
                    return;
                }
            }
            event.preventDefault();
            if (fromState.name != "^"){
                $location.url(fromState.url);
            }else{
                $location.url('seedbox/dashboard');
            }
        }
    });

});
