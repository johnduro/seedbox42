
app.controller('torrentsCtrl', function ($scope, $rootScope, RequestHandler) {

	console.log("torrentsCtrl");

	$scope.newTorrentUrl = "";

	$scope.sendTorrentUrl = function(){
		RequestHandler.post(api + "torrent/add-url", {"url": $scope.newTorrentUrl})
			.then(function(result){

		});
	}

	$scope.torrents = [
		{
			name: "test1",
			size: 100,
			pourcentage: 10
		},
		{
			name: "test2",
			size: 1260,
			pourcentage: 60
		},
		{
			name: "test3",
			size: 7500,
			pourcentage: 28
		},
		{
			name: "test4",
			size: 10000,
			pourcentage: 95
		}
	];
});
