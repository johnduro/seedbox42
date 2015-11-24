
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, $location, RequestHandler, socket) {

	console.log("dashboardCtrl");

	$scope.newMessage = "";

	$scope.content = [
	    {"name" : "recent-user-file", "enabled" : "all", "template" : "files-list", "title": "recent-user-file", "order": 3},
	    {"name" : "recent-file", "enabled" : "all", "template" : "files-list", "title": "recent-file", "order": 1},
		{"name" : "chat", "enabled" : "all", "template" : "dashboardChat", "title": "Mini chat", "order": 0}
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
});
