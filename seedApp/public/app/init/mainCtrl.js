app.controller('mainCtrl', function ($scope, $rootScope, User, Torrent) {
    	$scope.auth = function(user) {
		User.connect(user)
		   .success(function(resp) {
		   	var token = resp.token;
		   });
		};

	$scope.upload = function(torrent) {
		Torrent.send(torrent);
	};
});
