app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http, $location, $timeout, $cookies, RequestHandler, socket, Tools, toaster) {

	console.log("seedboxCtrl");

	$rootScope.token = localStorage.getItem("token");

	$rootScope.connectedUsersLogin = [];

	var roles = {
		"1" : "user",
		"0": "admin"
	};

	//Check si l'utilisateur est connecte
	if (!$rootScope.token){
		$state.go("connexion");
	}else{
		$cookies.put("token", $rootScope.token);
		$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;
		socket.connection();
		Tools.getUser().then(function(user){
			if (user.role == 0){
				delete $http.defaults.headers.common['X-Access-Token'];
				RequestHandler.get("https://raw.githubusercontent.com/johnduro/seedbox42/master/package.json").then(function (pkgjson) {
					if ($rootScope.ttVersion != pkgjson.data.version)
						toaster.pop('info', 'New version !', 'A new version (' + pkgjson.data.version + ') of TeurpiTorrent is available', 10000);
				});
				$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;
			}
		});
	}

	socket.emit("chat:get:message", null, function(data){
		//$rootScope.chatMessages = data.message;
		//console.log("chat", data.message);
		//element.html(resultTemplate.data).show();
		//$compile(element.contents())(scope);
	});

	RequestHandler.get(api + "admin/settings")
        .then(function(result){
            if (result.data.success){
                $rootScope.config = result.data.data;
				$scope.ShowConnected = function () {
					if ($rootScope.config.users['show-connected'] == 'all' || $rootScope.config.users['show-connected'] == roles[$rootScope.user.role])
						return true;
					return false;
				};
            }
        });

	//Gestion des onglets du menu
	$scope.isActive = function (viewLocation) {
		var str = $location.path();
        return str.startsWith(viewLocation);
    };

	//Fonction de deconnexion
	$scope.logout = function(){
		console.log("logout");
		socket.disconnect();
		localStorage.clear();
	};

	//Evenement du nombre d'utilisateurs connectes
	socket.on('connectedUsers', function(data){
		$timeout(function() {
			$rootScope.connectedUsers = data.connectedUsers;
		}, 500);
	});

	socket.on('update:config', function () {
		Tools.getConfig(true);
	});

	socket.on('connectedUsers', function (data) {
		$rootScope.connectedUsersLogin = data.logins;
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
		toaster.pop('success', "Fin de telechargement", data.data.name, 5000);
	});

});
