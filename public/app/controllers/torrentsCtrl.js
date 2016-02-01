
app.controller('torrentsCtrl', function ($scope, $rootScope, $interval, $timeout, socket, RequestHandler, Upload, Tools, $filter, toaster) {

	console.log("torrentsCtrl");

	//------------------------------------------------  VARIABLES -------------------------------------------------------
	$scope.torrentUrls = [
		"magnet:?xt=urn:btih:2b12ce09236526a728c6974c0d89d52860e82daa&dn=Major+Lazer+x+DJ+Snake+feat.+M%26Oslash%3B+-+Lean+On.mp3&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969",
		"https://torcache.net/torrent/C54CE5AD116BD42F0C8FB59E79FC9BEC0D2919F8.torrent?title=[kat.cr]alcohol.120.2.0.3.8314.final.crack.techtools",
		"https://torcache.net/torrent/8C0AC56C38391A50EC542220F7E83D9544292BCA.torrent?title=[kat.cr]fansub.resistance.naruto.shippuuden.438.1280x720.mp4"
	]
	$scope.newTorrentUrl = "";
	$scope.torrents = [];
	$scope.checkboxAll = false;
	$scope.itemSelected = [];
	$scope.search = "";
	$scope.filters = {
		isFinished: "",
		status: "",
		isActive: ""
	};
	var roles = {
		"1" : "user",
		"0": "admin",
	};
	$scope.selected = "all";


	//------------------------------------------------  EVENTS SOCKETS -------------------------------------------------------
	socket.emit('torrentRefresh');

	socket.on("put:torrent:rename", function(data){
		$scope.torrents[data.id].name = data.newName;
	});

	socket.on('delete:torrent', function(data){
		for (var key in data.ids){
			var index = $scope.itemSelected.indexOf(data.ids[key]);
			if (index >= 0)
				$scope.itemSelected.splice(index, 1);
			delete $scope.torrents[data.ids[key]];
		}
	});

	socket.on('post:torrent', function(data){
		if (data.success){
			$scope.newTorrentUrl = "";
			RequestHandler.get(api + "torrent/refresh/" + data.id)
				.then(function(resultRefresh){
					$scope.torrents[data.id] = resultRefresh.data.data.torrents[0];
					toaster.pop('success', "Un nouveau torrent a ete ajoute", data.name, 10000);
			});
		}
	});

	socket.on("torrentRefreshRes", function(data){
		var active = [];
		angular.forEach(data.result.torrents, function(newTorrent, keys) {
			if (newTorrent.id in $scope.torrents){
				for (var key in newTorrent){
					$scope.torrents[newTorrent.id][key] = newTorrent[key];
				};
				$scope.torrents[newTorrent.id].percentDone2 = $scope.torrents[newTorrent.id].percentDone * 100;
				$scope.torrents[newTorrent.id].time = timeInterval($scope.torrents[newTorrent.id].eta);
				active.push(newTorrent.id);
			}
		});
		angular.forEach($scope.torrents, function (torrentIt) {
			if (active.indexOf(torrentIt.id) > -1)
			{
				torrentIt.isActive = true;
			}
			else
				torrentIt.isActive = false;
		});
	});

	socket.on("torrentFirstRefresh", function(data){
		for(var key in data.torrents.torrents){
			$scope.torrents[data.torrents.torrents[key].id] = angular.copy(data.torrents.torrents[key]);
			$scope.torrents[data.torrents.torrents[key].id].percentDone2 = $scope.torrents[data.torrents.torrents[key].id].percentDone * 100;
			$scope.torrents[data.torrents.torrents[key].id].time = timeInterval($scope.torrents[data.torrents.torrents[key].id]);
			$scope.torrents[data.torrents.torrents[key].id].checkbox = false;
		}
	});

	//------------------------------------------------  FUNCTIONS SCOPE -------------------------------------------------------
	$scope.torrentRemove = function(arrayId, local){
		if ($rootScope.user.role == 0 || $rootScope.config.torrents['delete-torrent-enabled']){
			if (!arrayId.length){
				arrayId = Tools.getElementForMatchValue($scope.torrents, "id", "checkbox", true);
			}
			socket.emit('delete:torrent', {"ids": arrayId, "removeLocalData": local});
		}else{
			toaster.pop('error', "Error", "You can't remove torrent.", 5000);
		}
	};

	$scope.torrentRename = function(data, id){
		RequestHandler.put(api + "torrent/rename/" + id, {'newName': data})
			.then(function(result){});
	};

	$scope.sendTorrentUrl = function(){
		if ($rootScope.user.role == 0 || $rootScope.config.torrents['add-torrent-enabled'])
			socket.emit('post:torrent:url', {"url":$scope.newTorrentUrl, "id": $rootScope.user._id});
		else
			toaster.pop('error', "Error", "You can't add torrents.", 5000);
	};

	$scope.torrentStop = function(arrayId){
		if (!arrayId.length){
			arrayId = Tools.getElementForMatchValue($scope.torrents, "id", "checkbox", true);
		}
		RequestHandler.post(api + "torrent/action/stop", {ids: arrayId})
			.then(function (result){
				if (result.data.success){
					for (var i=0; i < arrayId.length; i++){
						$scope.torrents[arrayId[i]].status = 0;
					}
				}
			});
	};

	$scope.torrentMove = function(arrayId, direction){
		if (!arrayId.length){
			arrayId = Tools.getElementForMatchValue($scope.torrents, "id", "checkbox", true);
		}
		RequestHandler.post(api + "torrent/move/" + direction, {ids: arrayId});
	}

	$scope.torrentStart = function(arrayId){
		if (!arrayId.length){
			arrayId = Tools.getElementForMatchValue($scope.torrents, "id", "checkbox", true);
		}
		RequestHandler.post(api + "torrent/action/start", {ids: arrayId});
	};

	$scope.torrentAction = function(arrayId, action){
		if (!arrayId.length){
			arrayId = Tools.getElementForMatchValue($scope.torrents, "id", "checkbox", true);
		}
		RequestHandler.post(api + "torrent/action/" + action, {ids: arrayId});
	};

	$scope.FileConvertSize = function (aSize){
		return Tools.FileConvertSize(aSize);
	};

	$scope.checkboxSwitch = function(id){
		var index = $scope.itemSelected.indexOf(id);
		if (index >=0){
			$scope.itemSelected.splice(index, 1);
		}else{
			$scope.itemSelected.push(id);
		}
	};

	$scope.selectAll = function(){
		if ($scope.checkboxAll){
			var itemsFilter = $filter('filter')($scope.torrents, $scope.filters);
			Tools.setAllItems(itemsFilter, "checkbox", true);
			$scope.itemSelected = Tools.getElementForMatchValue(itemsFilter, "id", "checkbox", true);
		}else{
			Tools.setAllItems($scope.torrents, "checkbox", false);
			$scope.itemSelected = [];
		}
	};

	$scope.selectStatus = function (status){
		$scope.filters.isFinished = "";
		$scope.filters.status = "";
		$scope.filters.isActive = "";

		if (status == "all"){
			console.log("All");
		}else if (status == "finished"){
			$scope.filters.isFinished = true;
		}else if (status == "active"){
			$scope.filters.isActive = true;
		}else{
			$scope.filters.status = status;
		}
	};

	$scope.renderProgressBar = function (torrent) {
		if (torrent.isFinished || torrent.isStalled || torrent.status == 0 || torrent.status == 1 || torrent.status == 3 || torrent.status == 5)
			return 'ts-progressbar-inactive';
		else
			return 'ts-progressbar-active';
	};

	//------------------------------------------------  CLICK RIGHT -------------------------------------------------------
	$scope.menuOptions = [
		['Pause', function ($itemScope) {
	        $scope.torrentStop([$itemScope.torrent.id]);
	    }],
		['Resume', function ($itemScope) {
	        $scope.torrentStart([$itemScope.torrent.id]);
	    }],
		null,
		['Move to Top', function ($itemScope) {
	        $scope.torrentMove([$itemScope.torrent.id], "top");
	    }],
		['Move Up', function ($itemScope) {
	        $scope.torrentMove([$itemScope.torrent.id], "up");
	    }],
		['Move Down', function ($itemScope) {
	        $scope.torrentMove([$itemScope.torrent.id], "down");
	    }],
		['Move to Bottom', function ($itemScope) {
	        $scope.torrentMove([$itemScope.torrent.id], "bottom");
	    }],
		null,
	    ['Remove From List', function ($itemScope) {
			$scope.torrentRemove([$itemScope.torrent.id], true);
	    }],
	    ['Trash Data And Remove From List', function ($itemScope) {
	        $scope.torrentRemove([$itemScope.torrent.id], false);
	    }],
		null,
		['Verify Local Data', function ($itemScope) {
	        $scope.torrentAction([$itemScope.torrent.id], "verify");
	    }],
		['Ask trackers for more peers', function ($itemScope) {
	        $scope.torrentAction([$itemScope.torrent.id], "reannounce");
	    }],
	];

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
		if ($rootScope.user.role == 0 || $rootScope.config.torrents['add-torrent-enabled']){
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
						/*if (!data[0].success){
							toaster.pop('error', "Error", "L'ajout du nouveau torrent a echoue...", 5000);
						}*/
	                }).error(function (data, status, headers, config) {
						toaster.pop('error', "Error", "L'ajout du nouveau torrent a echoue...", 5000);
					});
	              }
	            }
	        }
		}else
			toaster.pop('error', "Error", "You can't add torrents.", 5000);

    };

	function timeInterval(seconds)
	{
		var days    = Math.floor (seconds / 86400),
		    hours   = Math.floor ((seconds % 86400) / 3600),
		    minutes = Math.floor ((seconds % 3600) / 60),
		    seconds = Math.floor (seconds % 60),
		    d = days    + ' ' + (days    > 1 ? 'days'    : 'day'),
		    h = hours   + ' ' + (hours   > 1 ? 'hours'   : 'hour'),
		    m = minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute'),
		    s = seconds + ' ' + (seconds > 1 ? 'seconds' : 'second');

		if (days) {
			if (days >= 4 || !hours)
				return d;
			return d + ', ' + h;
		}
		if (hours) {
			if (hours >= 4 || !minutes)
				return h;
			return h + ', ' + m;
		}
		if (minutes) {
			if (minutes >= 4 || !seconds)
				return m;
			return m + ', ' + s;
		}
		return s;
	}

});
