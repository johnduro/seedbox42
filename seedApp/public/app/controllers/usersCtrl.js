app.controller('usersCtrl', function ($scope, $rootScope, RequestHandler) {

	console.log("usersCtrl");

	$scope.view = "list";
	$scope.newUser = {
		login: "test",
		mail: "test@hotmail.fr",
		password: "okok",
		role: 1
	}

	RequestHandler.get(api + "users")
		.then(function(result){
			$scope.users = result.data;
	});

	$scope.changeView = function(view){
		$scope.view = view;
	};

	$scope.addUser = function(){
		RequestHandler.post(api + "users", $scope.newUser)
			.then(function(result){
				if (result.data.success){
					$scope.users = result.data.data;
				}
			});
	};

	$scope.deleteUser = function(id){
		RequestHandler.delete(api + "users/"+id)
			.then(function(result){
				if (result.data.success){
					$scope.users = result.data.data;
				}
			});
	};
});
