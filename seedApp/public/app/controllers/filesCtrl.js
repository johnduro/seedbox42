
app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.tree = result.data.data;
			console.log(result);
			//$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
	});

});
