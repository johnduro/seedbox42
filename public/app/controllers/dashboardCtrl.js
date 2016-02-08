
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, $filter, $http, RequestHandler, socket, Tools, toaster) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";
	$scope.content = [];
	var roles = {
		"1" : "user",
		"0": "admin",
	};

	Tools.getConfig().then(function(result){
		Tools.getUser().then(function(user){
			for (var key in result.dashboard.panels){
				if (result.dashboard.panels[key].enabled == "all" || result.dashboard.panels[key].enabled == roles[user.role])
					$scope.content.push(result.dashboard.panels[key]);
			}
			$scope.content = $filter('orderBy')($scope.content, 'order', false);
			if (user.role == 0)
			{
				delete $http.defaults.headers.common['X-Access-Token'];
				RequestHandler.get("https://raw.githubusercontent.com/johnduro/seedbox42/master/package.json").then(function (pkgjson) {
					if ($rootScope.ttVersion != pkgjson.data.version)
						toaster.pop('info', 'New version !', 'A new version (' + pkgjson.data.version + ') of TeurpiTorrent is available', 10000);
				});
				$http.defaults.headers.common['X-Access-Token'] = $rootScope.token;
			}
		});
	});
});
