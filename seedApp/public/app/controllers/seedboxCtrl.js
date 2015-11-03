app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http, $location, socket, $timeout, $cookies, RequestHandler) {

	console.log("seedboxCtrl");

	//Check si un utilisateur est connecte
	if (!$rootScope.token){
		$state.go("connexion");
	}else{
		$cookies.put("token", $rootScope.token);
		if (!$rootScope.user){
			RequestHandler.get(api + "users/profile")
				.then(function(result){
					$rootScope.user = result.data.data;
				});
		}
	}

	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

	$scope.logout = function(){
		console.log("logout");
		localStorage.clear();
	}

	$rootScope.msgInfo = function(title, msg){
		setTimeout(function() {
			toastr.options = {
				closeButton: true,
				progressBar: true,
				showMethod: 'fadeIn',
				hideMethod: 'fadeOut',
				timeOut: 10000
			};
			toastr.success(msg, title);
		}, 1800);
	};

	socket.on("newFile", function(data){
		console.log(data);
		setTimeout(function() {
			toastr.options = {
				closeButton: true,
				progressBar: true,
				showMethod: 'fadeIn',
				hideMethod: 'fadeOut',
				timeOut: 5000
			};
			toastr.success(data.data.name, 'Fin de telechargement');
		}, 1800);
	});

	socket.on('connectedUsers', function(data){
		$timeout(function() {
			$rootScope.connectedUsers = data.connectedUsers;
		}, 500);
	});

});
