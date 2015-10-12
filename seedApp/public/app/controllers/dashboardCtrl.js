
app.controller('dashboardCtrl', function ($scope, $rootScope, socket, $timeout) {

	console.log("dashboardCtrl");
	socket.emit('connection');
	$scope.connectedUsers = 0;

	socket.on('connected-users', function(data){
		$timeout(function() {
			$scope.connectedUsers = data.connectedUsers;
		  	$scope.$apply();
	    }, 500);
	});
});
