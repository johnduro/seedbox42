
app.controller('torrentsCtrl', function ($scope, $rootScope, $interval, RequestHandler) {

	console.log("torrentsCtrl");

	$scope.newTorrentUrl = "https://torcache.net/torrent/63296C6FB9A25EEBA55E1FCBA25DEF257F0B0EDD.torrent?title=[kat.cr]the.walking.dead.s06e01.proper.hdtv.x264.killers.ettv";

	function getTorrents(){
		RequestHandler.get(api + "torrent/get-all-torrents")
			.then(function(result){
				$scope.torrents = result.data.data.torrents;
				angular.forEach($scope.torrents, function(torrent, key) {
					torrent.pourcentage = torrent.percentDone * 100;
				});
				console.log(result.data.data.torrents);
		});
	};
	getTorrents();

	$interval(getTorrents, 10000);

	$scope.torrentRemove = function(id){
		RequestHandler.delete(api + "torrent/" + id)
			.then(function(result){
				if (result.data.success){
					getTorrents();
				};
		});
	};

	$scope.torrentStop = function(id){
		RequestHandler.post(api + "torrent/action/stop/" + id)
			.then(function(result){
				if (result.data.success){
					getTorrents();
				};
		});
	};

	$scope.torrentStart = function(id){
		RequestHandler.post(api + "torrent/action/start/" + id)
			.then(function(result){
				if (result.data.success){
					getTorrents();
				};
		});
	};

	$scope.sendTorrentUrl = function(){
		RequestHandler.post(api + "torrent/add-url", {"url": $scope.newTorrentUrl})
			.then(function(result){
				if(result.data.success){
					getTorrents();
				};
		});
	};
});
