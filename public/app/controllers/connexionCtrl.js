
app.controller('connexionCtrl', function ($scope, $rootScope, $state, RequestHandler, toaster) {

	console.log("connexionCtrl");

	$scope.user = {};
	$scope.user.login = "";
	$scope.user.password = "";

	$scope.connexion = function(){
		RequestHandler.post(api + "authenticate", $scope.user)
			.then(function(result){
				if (result.data.success){
					$rootScope.user = result.data.data;
					$rootScope.token = result.data.token;

					localStorage.setItem("token", result.data.token);
					$state.go("seedbox.dashboard");
				}else{
					toaster.pop('error', "Wrong login or password !", "", 5000);
				}
		})
	}
});
