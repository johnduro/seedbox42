
app.controller('torrentsCtrl', function ($scope, $rootScope, RequestHandler) {

	console.log("torrentsCtrl");

	$scope.newTorrentUrl = "https://torcache.net/torrent/63296C6FB9A25EEBA55E1FCBA25DEF257F0B0EDD.torrent?title=[kat.cr]the.walking.dead.s06e01.proper.hdtv.x264.killers.ettv";

	$scope.sendTorrentUrl = function(){
		RequestHandler.post(api + "torrent/add-url", {"url": $scope.newTorrentUrl})
			.then(function(result){

		});
	}

	RequestHandler.get(api + "torrent/get-all-torrents")
		.then(function(result){
			$scope.torrents = result.data.data.torrents;
			angular.forEach($scope.torrents, function(torrent, key) {
				torrent.pourcentage = torrent.percentDone * 100;
			});
			$scope.torrents.forEach(values)
			console.log(result.data.data.torrents);
	});
});
