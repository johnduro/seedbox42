app.controller('connectedCtrl', function ($scope, $rootScope, socket) {
	console.log('connectedCtrl');

	$scope.users = [];

	socket.emit('connectedUsers:details', null, function (data) {
		$scope.users = data;
	});
});
