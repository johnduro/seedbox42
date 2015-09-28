
app.controller('connexionCtrl', function ($scope, $rootScope, $state) {

	console.log("connexionCtrl");

	$scope.email = "test@hotmail.com";
	$scope.password = "okok";

	$scope.connexion = function(){
		$state.go("seedbox.dashboard");
	}
});
