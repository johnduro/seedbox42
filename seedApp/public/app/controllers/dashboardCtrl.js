
app.controller('dashboardCtrl', function ($scope, $rootScope, $timeout, RequestHandler) {

	console.log("dashboardCtrl");

	RequestHandler.get(api + "dashboard")
		.then(function(result){
			$scope.lastFiles = result.data.lastFiles;
			$scope.userLastFiles = result.data.userLastFiles;
			$rootScope.tools.convertFields($scope.userLastFiles);
			$rootScope.tools.convertFields($scope.lastFiles);
			console.log(result);
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
