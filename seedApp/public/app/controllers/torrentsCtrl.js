
app.controller('torrentsCtrl', function ($scope, $rootScope, $interval, socket, RequestHandler) {

	console.log("torrentsCtrl");

	$scope.newTorrentUrl = "magnet:?xt=urn:btih:b115f4f2daf4baaf0fe4270653e69dc4f69eb3d2&dn=The.Flash.2014.S02E02.HDTV.x264-LOL%5Bettv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";

	socket.emit('torrentRefresh');

	socket.on("torrentRefreshRes", function(data){
		angular.forEach(data.result.torrents, function(newTorrent, keys) {
			//console.log($scope.torrents);
			if (newTorrent.id in $scope.torrents){
				for (var key in newTorrent){
					//console.log(key);
					$scope.torrents[newTorrent.id][key] = newTorrent[key];
				};
			}
		});
		//$scope.torrents = data.result.torrents;
		/*angular.forEach($scope.torrents, function(torrent, key) {
			torrent.pourcentage = torrent.percentDone * 100;
		});*/
		console.log(data);
	});

	socket.on("torrentFirstRefresh", function(data){
		$scope.torrents = {};
		for(var key in data.torrents.torrents){
			$scope.torrents[data.torrents.torrents[key].id] = data.torrents.torrents[key];
		}

		console.log("torrentFirstRefresh", $scope.torrents);
	});

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
	//getTorrents();

	//$interval(getTorrents, 30000);

	$scope.pourcentage = function(pr){
		console.log(pr);
		return (pr * 100);
	}

	$scope.torrentRemove = function(id, local){
		RequestHandler.delete(api + "torrent/" + id, {"removeLocalData": local})
			.then(function(result){
				if (result.data.success){
					//getTorrents();
				};
		});
	};

	$scope.torrentStop = function(id){
		RequestHandler.post(api + "torrent/action/stop/" + id)
			.then(function(result){
				if (result.data.success){
					//getTorrents();
				};
		});
	};

	$scope.torrentStart = function(id){
		RequestHandler.post(api + "torrent/action/start/" + id)
			.then(function(result){
				if (result.data.success){
					//getTorrents();
				};
		});
	};

	$scope.sendTorrentUrl = function(){
		RequestHandler.post(api + "torrent/add-url", {"url": $scope.newTorrentUrl})
			.then(function(result){
				if(result.data.success){
					$scope.torrents[result.data.id];
					RequestHandler.get(api + "torrent/refresh/" + result.data.id)
						.then(function(resultRefresh){
							console.log(resultRefresh);
							$scope.torrents[result.data.id] = resultRefresh.data.data.torrents[0];
					});
					console.log(result.data);
				};
		});
	};
});
