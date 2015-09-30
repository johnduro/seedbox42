
app.controller('connexionCtrl', function ($scope, $rootScope, $state, RequestHandler) {

	console.log("connexionCtrl");

	$scope.user = {};
	$scope.user.login = "lambda1";
	$scope.user.password = "passwd1";

	$scope.connexion = function(){
		RequestHandler.post("http://localhost:3000/authenticate/", $scope.user)
			.then(function(result){
				if (result.data.success){
					$rootScope.user = result.data.data;
					$rootScope.token = result.data.token;

					localStorage.setItem("user", JSON.stringify($rootScope.user));
					localStorage.setItem("token", JSON.stringify($rootScope.token));
					$state.go("seedbox.dashboard");
				}
		})
	}
});
