
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, $filter, $http, RequestHandler, socket, Tools, toaster) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";
	$scope.content = [];

	for (var key in $rootScope.config.dashboard.panels){
		if ($rootScope.config.dashboard.panels[key].enabled == "all" || $rootScope.config.dashboard.panels[key].enabled == roles[$rootScope.user.role])
			$scope.content.push($rootScope.config.dashboard.panels[key]);
	}

});
