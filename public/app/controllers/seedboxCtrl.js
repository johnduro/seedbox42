app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http, $location, $timeout, $cookies, RequestHandler, socket, Tools, toaster) {

	console.log("seedboxCtrl");

	$rootScope.token = localStorage.getItem("token");

	//Check si l'utilisateur est connecte
	if (!$rootScope.token){
		$state.go("connexion");
	}else{
		$cookies.put("token", $rootScope.token);
		$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;
		socket.connection();
		Tools.getUser();
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
