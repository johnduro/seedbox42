app.controller('seedboxCtrl', function ($scope, $rootScope, $state, $http) {

	console.log("seedboxCtrl");

	$rootScope.user = JSON.parse(localStorage.getItem("user"));
	$rootScope.token = JSON.parse(localStorage.getItem("token"));
	$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;

	//Check si un utilisateur est connecte
	if (!$rootScope.token){
		$state.go("connexion");
	}

	$scope.logout = function(){
		console.log("logout");
		localStorage.clear();
	}

});
