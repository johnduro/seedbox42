app.controller('usersCtrl', function ($scope, $rootScope, RequestHandler, Upload) {

	console.log("usersCtrl");

	$scope.view = "list";
	$scope.newUser = {
		login: "test",
		mail: "test@hotmail.fr",
		password: "okok",
		role: 1,
		avatar: ""
	}

	$scope.myFile;

	$scope.$on("fileSelected", function (event, args) {
        $scope.myFile = args.file;
    });

	RequestHandler.get(api + "users")
		.then(function(result){
			$scope.users = result.data;
	});

	$scope.changeView = function(view){
		$scope.view = view;
	};

	$scope.addUser = function(){
		console.log($scope);
		var file = $scope.myFile;

		var fd = new FormData();
        fd.append('avatar', file);
		fd.append('login', $scope.newUser.login);
		fd.append('mail', $scope.newUser.mail);
		fd.append('password', $scope.newUser.password);
		fd.append('role', $scope.newUser.role);
		RequestHandler.post(api + "users", fd, false, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
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

	$scope.showUser = function(user){
		console.log(user);
	}
});
