app.controller("fileCtrl", function($rootScope, $scope, $state, $stateParams, $modal, $http, RequestHandler, $sce, Tools){

    $scope.pathActualString = "";
    var pathActualArray = [];

    console.log($rootScope.states);

// --------------------------------------------- FUNCTION PRIVATE --------------------------------------------
    function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
		});
	};

    function generatePath(ArrayPath){
		var newPath = "";
		for(var key in ArrayPath){
			newPath = newPath + ArrayPath[key] +" / ";
		}
        return newPath;
	};

// --------------------------------------------- ACTION INIT TORRENT OPEN --------------------------------------------
    if ($stateParams.file){
        RequestHandler.get(api + "file/show/" + $stateParams.file)
            .then(function(result){
                $scope.torrent = result.data.file;
                $rootScope.torrentActual = result.data.file;
                $scope.torrent.sizeConvert = Tools.FileConvertSize($scope.torrent.size);
                $scope.torrent.gradeByUser = 4;
                console.log("TORRENT : ", $scope.torrent);

                if (result.data.data.fileList.length){
                    addType(result.data.data.fileList);
                    $scope.treeActual = result.data.data;
                    $scope.treeBase = result.data.data;
                }
                else{
                    $scope.tree = null;
                }
            });
    }else{
        $state.go('seedbox.files');
    }

// --------------------------------------------- ACTION OPEN FOLDER --------------------------------------------
    $scope.openFolder = function(item){

		if (item.isDirectory){
            pathActualArray.push(item["name"]);
			$scope.treeActual = item;
			addType($scope.treeActual.fileList);
			$scope.pathActualString = generatePath(pathActualArray);
		}else if (item.type == "video"){
			//video.addSource(value.type, generatePathDownload($scope.treeSelected.id, value.name));
			//$scope.typeStreaming = value.fileType;
			//Lightbox.openModal([{url:generatePathDownload($scope.treeSelected.id, value.name)}], 0);
			$scope.pathStreaming = generatePathDownload($scope.treeSelected.id, item.name);
		}else if (item.type == "image"){
			Lightbox.openModal([{url:generatePathDownload($scope.treeSelected.id, item.name)}], 0);
		}
	};

// --------------------------------------------- ACTION BACK FOLDER --------------------------------------------
    var folderBack;
    $scope.backFolder = function(folder, ArrayPath){
        if (!pathActualArray.length)
            $state.go('seedbox.files');
        else{
            if(folder == $scope.treeActual){
                $scope.treeActual = folderBack;
                $scope.pathActualString = generatePath(ArrayPath);
                pathActualArray = ArrayPath;
            }else{
                for (var key in folder.fileList){
    				if (folder.fileList[key].isDirectory){
    					folderBack = folder;
    					if (folder.name != $scope.torrent.name)
                            ArrayPath.push(folder.name);
    					$scope.backFolder(folder.fileList[key], ArrayPath);
    				}
    			}
            }
        }
    }

// --------------------------------------------- FUNCTION DOWNLOAD --------------------------------------------
    function generatePathDownload(id, name){
		var save = false;
		var newPath = "";
		for(var key in pathActualArray){
			if (save){
				newPath = newPath + "/" + pathActualArray[key]
				break;
			}
			if (pathActualArray[key] == $scope.treeActual.name)
				save = true;
		}
		if (save){
			newPath += "/" + name;
		}else{
			newPath = "/";
		}

		pathEncode = btoa(newPath);
		nameEncode = btoa(name);
		return(api + "file/download/" + id + "/" + pathEncode + "/" + nameEncode);
	};

    $scope.download = function (id, name){
		path = generatePathDownload(id, name);
		window.location.href = path;
	};

// --------------------------------------------- FUNCTION LOCK FILE --------------------------------------------
    $scope.lockFile = function(item){
		RequestHandler.post(api + "file/add-lock/" + item._id)
			.then(function(result){
				if (result.data.success)
					item.isLockedByUser = true;
				console.log(item);
			});
	};

	$scope.unlockFile = function(item){
		RequestHandler.delete(api + "file/remove-lock/" + item._id, {})
			.then(function(result){
				if (result.data.success)
					item.isLockedByUser = false;
				console.log(result);
			});
	};


// --------------------------------------------- CONTROLLER MODAL SEARCH MOVIE --------------------------------------------
    $scope.openModal = {
        searchMovie: function () {
            var modalInstance = $modal.open({
                templateUrl: "modal.html",
                controller: function ($scope, $http, $modalInstance, RequestHandler) {

                    $scope.query = 'inside out';
                    $scope.result = "";
                    $scope.itemSelected = "";

                    $scope.search = function (){
                        var base = 'http://api.themoviedb.org/3';
                        var service = '/search/multi';
                        var apiKey = '6ab855d7f609fe00d970fe5671360bf0';
                        var callback = 'JSON_CALLBACK';
                        var url = base + service + '?api_key=' + apiKey + '&query=' + $scope.query + '&page=1&callback=' + callback;

                        $http.jsonp(url).then(function(data, status) {
                          $scope.result = data.data.results;
                        },function(data, status) {
                          $scope.result = 'Maybe you missed your API key?\n\n' + JSON.stringify(data.data.results);
                        });
                    };

                    $scope.select = function(item){
                        $scope.itemSelected.selected = "";
                        item.selected = "success";
                        $scope.itemSelected = item;
                    }

                    $scope.ok = function () {
                        $modalInstance.close($scope.itemSelected);
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
            modalInstance.result.then(function (itemSelected) {
                $scope.torrent.tmdb = itemSelected;
            });
        },
        streamMovie: function () {
            var modalInstance = $modal.open({
                templateUrl: "modalStream.html",
                resolve: {
                 torrent: function () {
                   return $scope.torrent;
                 }
             },
                controller: function ($scope, $http, $modalInstance, RequestHandler, torrent) {

                    $scope.stream = {
                        preload: "none",
                        sources: [
                            {src: $sce.trustAsResourceUrl("http://localhost:3000/file/download/5639e5ca4ef5032e04f0c91e/Lw==/RG9wZS4yMDE1LkZSRU5DSC5CRFJpcC5YdmlELUVYVFJFTUUud3d3LkNwYXNiaWVuLnB3LmF2aQ=="), type: torrent.fileType}
                        ],
                        tracks: [
                            {
                                src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                                kind: "subtitles",
                                srclang: "en",
                                label: "English",
                                default: ""
                            }
                        ],
                        theme: {
                            url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                        }
                    };

                    $scope.ok = function () {
                        $modalInstance.close($scope.itemSelected);
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            });
            modalInstance.result.then(function (itemSelected) {
                $scope.torrent.tmdb = itemSelected;
            });
        }
    };

});
