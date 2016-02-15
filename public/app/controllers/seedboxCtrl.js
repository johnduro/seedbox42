app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http, $location, $timeout, $cookies, RequestHandler, socket, Tools, toaster) {

	console.log("seedboxCtrl");
	$rootScope.connectedUsersLogin = [];
	$rootScope.connectedUsers;

	//Affichage des utilisateurs connectes
	$scope.ShowConnected = function () {
		if ($rootScope.config.users['show-connected'] == 'all' || $rootScope.config.users['show-connected'] == roles[$rootScope.user.role])
			return true;
		return false;
	};

	//Gestion des onglets du menu
	$scope.isActive = function (viewLocation) {
		var str = $location.path();
        return str.startsWith(viewLocation);
    };

	//Fonction de deconnexion
	$scope.logout = function(){
		socket.disconnect();
		$cookies.remove("token");
		localStorage.clear();
	};

	//Recuperation du pkjson pour verifier la version
	if ($rootScope.user.role == 0){
		RequestHandler.get("https://raw.githubusercontent.com/johnduro/seedbox42/master/package.json", "basic")
			.then(function (pkgjson) {
				$rootScope.pkgjson = pkgjson;
				if ($rootScope.ttVersion != $rootScope.pkgjson.data.version)
					toaster.pop('info', 'New version !', 'A new version (' + $rootScope.pkgjson.data.version + ') of TeurpiTorrent is available', 10000);
			});
	}

	//Recuperation des utilisateurs connectes
	socket.emit("connectedUsers", null, function(data){
		$rootScope.connectedUsers = data.connectedUsers;
		$rootScope.connectedUsersLogin = data.logins;
	});

	//Evenement pour la mise a jour de la config
	socket.on('update:config', function () {
		Tools.getConfig(true);
	});

	//Evenement quand un torrent est fini
	socket.on("newFile", function(data){
		toaster.pop('success', "Fin de telechargement", data.data.name, 5000);
	});

});
