var app = angular.module('seedApp', ['ngRoute', 'ui.router', 'ngCookies', 'ngVideo', 'ngFileUpload', 'bootstrapLightbox', 'angular.morris-chart', 'luegg.directives']);

// ---------------------- variable global -------------------------------
var api = "";

app.run(function ($rootScope, $location, $http) {

    if ($location.host() == "localhost"){
        api = "http://localhost:3000/";
    } else {
        api = "http://37.187.111.179:3000/";
    }

    api = "/";

    $rootScope.token = localStorage.getItem("token");
    console.log("TOKEN >> ", $rootScope.token);
    $rootScope.user = JSON.parse(localStorage.getItem("user"));
    $http.defaults.headers.common['X-Access-Token'] = $rootScope.token;


    $rootScope.tools = {
        convertSize: function (aSize){
    		aSize = Math.abs(parseInt(aSize, 10));
    		var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
    		for(var i=0; i<def.length; i++){
    			if(aSize<def[i][0])
    				return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
    		}
    	},
        convertFields: function(list){
    		angular.forEach(list, function(value, key){
    			res = value.fileType.split("/");
    			value.type = res[0];
    			value.sizeConvert = $rootScope.tools.convertSize(value.size);
    		});
    	}
    };

});
