
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, RequestHandler, socket, Tools) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";
	$scope.content = {};
	var roles = {
		"1" : "user",
		"0": "admin",
	};

	Tools.getConfig().then(function(result){
		Tools.getUser().then(function(user){
			for (var key in result.dashboard.panels){
				if (result.dashboard.panels[key].enabled != roles[user.role] && result.dashboard.panels[key].enabled != "all")
					result.dashboard.panels.splice(key, 1);
			}
			$scope.content = result.dashboard.panels;
		});
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
