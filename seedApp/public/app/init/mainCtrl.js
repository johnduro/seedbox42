
/// -------------------------- LE CONTROLLEUR NEST PLUS UTILISER ------------------------------



app.controller('mainCtrl', function ($scope, $rootScope, User, Torrent, socket) {

	/*var socket = io();

	socket.on('torrent', function(msg){
  		console.log('received: ' + msg);
	});*/

	$scope.auth = function(user) {
		User.connect(user)
	   	.success(function(resp) {
			console.log(resp);
	   		$scope.token = resp.token;
			$scope.torrent = {
				token: $scope.token,
			}
	   	})
	   	.error(function(resp) {
			console.log(resp);
		});
	};

	//$location.path('/app/index.html')

	$scope.upload = function(torrent) {
		Torrent.send(torrent)
		.success(function(resp) {
			console.log(resp);
		})
		.error(function(resp) {
			console.log(resp);
		});
	};

	$scope.info = function(torrent) {
		Torrent.fetch(torrent)
		.success(function(resp) {
			console.log(resp);
			$scope.info = resp;
		})
		.error(function(resp) {
			console.log(resp);
		});
	};

	socket.on("new-torrent", function(data){
		setTimeout(function() {
	        toastr.options = {
	            closeButton: true,
	            progressBar: true,
	            showMethod: 'fadeIn',
	            hideMethod: 'fadeOut',
	            timeOut: 5000
	        };
	        toastr.success('Checkout settings menu on left!', 'Welcome to Modern!');
	    }, 1800);
	});

});
