var app = angular.module('seedApp', ['ngRoute', 'ui.router', 'ngCookies', 'ngVideo', 'ngFileUpload']);

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

});
