
app.controller('torrentsCtrl', function ($scope, $rootScope, $interval, socket, RequestHandler) {

	console.log("torrentsCtrl");

	//------------------------------------------------  VARIABLES -------------------------------------------------------
	$scope.newTorrentUrl = "magnet:?xt=urn:btih:b115f4f2daf4baaf0fe4270653e69dc4f69eb3d2&dn=The.Flash.2014.S02E02.HDTV.x264-LOL%5Bettv%5D&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";
	$scope.torrents = {};

	//------------------------------------------------  EVENTS SOCKETS -------------------------------------------------------
	socket.emit('torrentRefresh');

	socket.on('delete:torrent', function(data){
		delete $scope.torrents[data.id];
	});

	socket.on('post:torrent:url', function(data){
		if (data.success){
			RequestHandler.get(api + "torrent/refresh/" + data.id)
				.then(function(resultRefresh){
					$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
			});
		}		
	});

	socket.on("torrentRefreshRes", function(data){
		angular.forEach(data.result.torrents, function(newTorrent, keys) {
			if (newTorrent.id in $scope.torrents){
				for (var key in newTorrent){
					$scope.torrents[newTorrent.id][key] = newTorrent[key];
				};
				$scope.torrents[newTorrent.id].percentDone = $scope.torrents[newTorrent.id].percentDone * 100;
			}
		});
	});

	socket.on("torrentFirstRefresh", function(data){
		for(var key in data.torrents.torrents){
			$scope.torrents[data.torrents.torrents[key].id] = data.torrents.torrents[key];
			$scope.torrents[data.torrents.torrents[key].id].percentDone = $scope.torrents[data.torrents.torrents[key].id].percentDone * 100;
		}
	});

	//------------------------------------------------  FUNCTIONS PRIVATE -------------------------------------------------------
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

	//------------------------------------------------  FUNCTIONS SCOPE -------------------------------------------------------
	$scope.torrentRemove = function(id, local){
		socket.emit('delete:torrent', {"id":id, "removeLocalData": local});
	};

	$scope.sendTorrentUrl = function(){
		socket.emit('post:torrent:url', {"url":$scope.newTorrentUrl});
	};

	$scope.torrentStop = function(id){
		RequestHandler.post(api + "torrent/action/stop/" + id);
	};

	$scope.torrentStart = function(id){
		RequestHandler.post(api + "torrent/action/start/" + id);
	};
});
