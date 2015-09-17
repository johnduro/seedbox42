app.controller('mainCtrl', function ($scope, $rootScope, User, Torrent) {
	$scope.auth = function(user) {
		console.log(user);
		User.connect(user)
	   	.success(function(resp) {
	   		$scope.token = resp.token;
			$scope.torrent = {
				token: $scope.token,
			}
	   	})
	   	.error(function(resp) {
			console.log(resp);
		});
	};

	$scope.upload = function(torrent) {
		console.log(torrent);
		Torrent.send(torrent)
		.success(function(resp) {
			console.log(resp);
		})
		.error(function(resp) {
			console.log(resp);
		});
	};
});
