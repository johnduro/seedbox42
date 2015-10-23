
app.controller('torrentsCtrl', function ($scope, $rootScope, $interval, $timeout, socket, RequestHandler, Upload) {

	console.log("torrentsCtrl");

	//------------------------------------------------  VARIABLES -------------------------------------------------------
	$scope.newTorrentUrl = "magnet:?xt=urn:btih:2b12ce09236526a728c6974c0d89d52860e82daa&dn=Major+Lazer+x+DJ+Snake+feat.+M%26Oslash%3B+-+Lean+On.mp3&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";
	$scope.torrents = {};

	//------------------------------------------------  EVENTS SOCKETS -------------------------------------------------------
	socket.emit('torrentRefresh');

	socket.on('delete:torrent', function(data){
		delete $scope.torrents[data.id];
	});

	socket.on('post:torrent', function(data){
		if (data.success){
			RequestHandler.get(api + "torrent/refresh/" + data.id)
				.then(function(resultRefresh){
					$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
					$rootScope.msgInfo("Un nouveau torrent a ete ajoute", data.name);
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
		console.log($scope.torrents);
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
		socket.emit('post:torrent:url', {"url":$scope.newTorrentUrl, "id": $rootScope.user._id});
	};

	$scope.torrentStop = function(id){
		RequestHandler.post(api + "torrent/action/stop/" + id);
	};

	$scope.torrentStart = function(id){
		RequestHandler.post(api + "torrent/action/start/" + id);
	};

	$scope.FileConvertSize = function(aSize){
		if (aSize == 0)
			return 0;
		aSize = Math.abs(parseInt(aSize, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
		for(var i=0; i<def.length; i++){
			if(aSize<def[i][0])
				return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
		}
	}

	//------------------------------------------------  DRAG & DROP-------------------------------------------------------

	$scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = '';

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: '/torrent/add-torrents',
                    data: {
                      username: $scope.username,
                      torrent: file
                    }
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
					if (!data[0].success){
						$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
					}
                }).error(function (data, status, headers, config) {
					$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
				});
              }
            }
        }
    };

});
