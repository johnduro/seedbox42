app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http, $location, socket, $timeout, $cookies, RequestHandler) {

	console.log("seedboxCtrl");

	$rootScope.token = localStorage.getItem("token");

	//Check si l'utilisateur est connecte
	if (!$rootScope.token){
		$state.go("connexion");
	}else{
		$cookies.put("token", $rootScope.token);
		$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;
		if (!$rootScope.user){
			RequestHandler.get(api + "users/profile")
				.then(function(result){
					$rootScope.user = result.data.data;
				});
		}
	}

	//Gestion des onglets du menu
	$scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

	//Fonction de deconnexion
	$scope.logout = function(){
		console.log("logout");
		localStorage.clear();
	};

	//Evenement du nombre d'utilisateurs connectes
	socket.on('connectedUsers', function(data){
		$timeout(function() {
			$rootScope.connectedUsers = data.connectedUsers;
		}, 500);
	});

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

	//Evenement quand un torrent est fini
	socket.on("newFile", function(data){
		$rootScope.msgInfo("Fin de telechargement", data.data.name);
		console.log(data);
	});

});
