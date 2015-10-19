
app.controller('connexionCtrl', function ($scope, $rootScope, $state, RequestHandler) {

	console.log("connexionCtrl");

	$scope.user = {};
	$scope.user.login = "admin";
	$scope.user.password = "admin";

	$scope.connexion = function(){
		RequestHandler.post(api + "authenticate", $scope.user)
			.then(function(result){
				if (result.data.success){
					localStorage.setItem("user", JSON.stringify(result.data.data));
					localStorage.setItem("token", result.data.token);
					$state.go("seedbox.dashboard");
				}
		})
	}
});
