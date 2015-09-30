
app.controller('usersCtrl', function ($scope, $rootScope, RequestHandler) {

	console.log("usersCtrl");

	RequestHandler.get("http://localhost:3000/users")
		.then(function(result){
			$scope.users = result.data;
	});
});
