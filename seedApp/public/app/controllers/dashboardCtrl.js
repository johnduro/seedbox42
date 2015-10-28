
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, RequestHandler, socket) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";

	RequestHandler.get(api + "dashboard/disk-space")
		.then(function(result){
			$scope.chartData = [
		      {label: "Free space", value: result.data.data.freePer},
		      {label: "Used space", value: result.data.data.usedPer},
		    ];
			$scope.myFormatter = function(input) {
		      return input + '%';
		    };
		});

	RequestHandler.get(api + "dashboard/recent-user-file")
		.then(function(result){
			$scope.userLastFiles = result.data.data;
			$rootScope.tools.convertFields($scope.userLastFiles);
		});

	RequestHandler.get(api + "dashboard/recent-file")
		.then(function(result){
			$scope.lastFiles = result.data.data;
			$rootScope.tools.convertFields($scope.lastFiles);
		});

	socket.emit("chat:get:message", null, function(data){
		$scope.messages = data.message;
	});

	$scope.sendMessage = function(){
		socket.emit("chat:post:message", {message: $scope.newMessage, id:$rootScope.user._id});
		$scope.newMessage = "";
	};

	socket.on("chat:post:message", function(data){
		$scope.messages.push(data.newmessage);
	});

});
