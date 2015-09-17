var app = angular.module('App', ['ngRoute']);

app.run(function ($rootScope) {

});

app.factory("User", function ($http) {
    var API_URI = '/authentification';

    return {

        connect : function(user) {
            return $http.post(API_URI, user);
        }
    };

});

app.factory("Torrent", function ($http) {
    var API_URI = '/torrent';

    return {

        send : function(torrent) {
            return $http.post(API_URI, torrent);
        }
    };

});
