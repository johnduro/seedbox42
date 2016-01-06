app.factory("User", function ($http) {
    var API_URI = '/authenticate';

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
        },

	fetch : function(torrent) {
		return $http.get(API_URI+'?token='+torrent.token);
	}
    };

});
