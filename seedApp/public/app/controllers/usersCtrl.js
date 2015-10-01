
app.controller('usersCtrl', function ($scope, $rootScope, RequestHandler) {

	console.log("usersCtrl");

	$scope.view = "list";

	RequestHandler.get("http://localhost:3000/users")
		.then(function(result){
			$scope.users = result.data;
	});

	$scope.changeView = function(view){
		$scope.view = view;
	}
});
