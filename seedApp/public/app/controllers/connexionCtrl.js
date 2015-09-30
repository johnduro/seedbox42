
app.controller('connexionCtrl', function ($scope, $rootScope, $state, RequestHandler) {

	console.log("connexionCtrl");

	$scope.user = {};
	$scope.user.email = "test@hotmail.com";
	$scope.user.password = "okok";

	$scope.connexion = function(){
		RequestHandler.post("http://localhost:3000/authenticate/", $scope.user)
			.then(function(result){
				console.log(result);
		})
		//$state.go("seedbox.dashboard");
	}
});
