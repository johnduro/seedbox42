var app = angular.module('seedApp', ['ngRoute', 'ui.router']);

// ---------------------- variable global -------------------------------
var api = "";

app.run(function ($rootScope, $location) {

    if ($location.host() == "localhost"){
        api = "http://localhost:3000/";
    } else {
        api = "http://37.187.111.179/";
    }

});
