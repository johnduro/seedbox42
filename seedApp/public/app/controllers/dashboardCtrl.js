
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, RequestHandler, socket, Tools) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";

	Tools.getConfig().then(function(result){
		$scope.content = result.dashboard.panels;
		console.log($scope.content);
	});

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
});
