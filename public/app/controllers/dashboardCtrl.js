
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, $filter, $http, RequestHandler, socket, Tools, toaster, rconfig, ruser) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";
	$scope.content = [];
	var roles = {
		"1" : "user",
		"0": "admin",
	};

	for (var key in rconfig.dashboard.panels){
		if (rconfig.dashboard.panels[key].enabled == "all" || rconfig.dashboard.panels[key].enabled == roles[ruser.role])
			$scope.content.push(rconfig.dashboard.panels[key]);
	}

});
