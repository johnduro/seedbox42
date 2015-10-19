
app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.tree = result.data.data;
			angular.forEach($scope.tree, function(value, key){
				res = value.fileType.split("/");
				value.type = res[0];
			});
			console.log($scope.tree);
			//$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
	});
});
