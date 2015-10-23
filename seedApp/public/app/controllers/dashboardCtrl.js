
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, RequestHandler, socket) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";

	RequestHandler.get(api + "dashboard")
		.then(function(result){
			$scope.lastFiles = result.data.lastFiles;
			$scope.userLastFiles = result.data.userLastFiles;
			$rootScope.tools.convertFields($scope.userLastFiles);
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


		var ctrl = this;
		ctrl.chartData = [
		      {label: "Download Sales", value: 12},
		      {label: "In-Store Sales", value: 30},
		      {label: "Mail-Order Sales", value: 20}
		    ];
	    ctrl.chartColors = ["#31C0BE", "#c7254e", "#98a0d3"];
		ctrl.resize = true;
	    ctrl.myFormatter = function(input) {
	      return input + '%';
	    };
});
