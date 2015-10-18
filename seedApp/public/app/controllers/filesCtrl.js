
app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.tree = result.data.data;
			console.log(result);
			//$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
	});

	toastr.options = {
		closeButton: true,
		progressBar: true,
		showMethod: 'fadeIn',
		hideMethod: 'fadeOut',
		timeOut: 5000
	};
	toastr.success('Checkout settings menu on left!', 'Welcome to Modern!');

});
