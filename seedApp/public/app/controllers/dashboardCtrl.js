
app.controller('dashboardCtrl', function ($scope, $rootScope, socket, $location) {

	console.log("dashboardCtrl");

	$scope.voteFor = function(choice){
	  socket.emit('vote', {vote : choice })
	}

	socket.on('votes', function(msg){
	  $scope.votes = msg.votes;
	  $scope.$apply();
	});
});
