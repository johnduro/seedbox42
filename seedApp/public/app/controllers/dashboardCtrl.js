
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, RequestHandler, socket) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";

	$scope.openFile = function(file){
		//console.log(file);
		$location.url('seedbox/file/' + file._id);
	};


	$scope.content = [
    {"name" : "recent-user-file", "enabled" : "all", "type" : "files-list", "title": "recent-user-file", "order": 0},
    {"name" : "recent-file", "enabled" : "all", "type" : "files-list", "title": "recent-file", "order": 0},
];

	RequestHandler.get(api + "dashboard/disk-space")
		.then(function(result){
			if (result.data.success){
				$scope.chartData = [
			      {label: "Free space", value: result.data.data.freePer},
			      {label: "Used space", value: result.data.data.usedPer},
			    ];
				$scope.myFormatter = function(input) {
			      return input + '%';
			    };
			}
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
