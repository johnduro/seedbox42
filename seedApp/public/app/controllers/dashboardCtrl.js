
app.controller('dashboardCtrl', function ($scope, $rootScope, socket, $timeout) {

	console.log("dashboardCtrl");

	$scope.connectedUsers = 0;

	socket.on('connectedUsers', function(data){
		$timeout(function() {
			$scope.connectedUsers = data.connectedUsers;
		  	$scope.$apply();
	    }, 500);
	});
});
