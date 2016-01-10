app.controller("fileCtrl", function($rootScope, $scope, $state, $stateParams, $modal, $http, RequestHandler, $sce, Tools, Upload){

    $scope.pathActualString = "";
    $scope.folderActual = '';
    var pathActualArray = [];

    console.log($rootScope);

// --------------------------------------------- FUNCTION PRIVATE --------------------------------------------
    function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
		});
	};

    function generatePath(ArrayPath, type){
		var newPath = "";
		for(var key in ArrayPath){
            if (type == "view")
			    newPath = newPath + ArrayPath[key] +" / ";
            else
                newPath = newPath + ArrayPath[key] +"/";
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
                console.log("TORRENT : ", $scope.torrent);

                if (result.data.data.fileList.length){
                    addType(result.data.data.fileList);
                    $scope.treeActual = result.data.data;
                    $scope.treeBase = result.data.data;
                    $scope.folderActual = result.data.file.name;
                }
                else{
                    $scope.tree = null;
                }

				$rootScope.$broadcast('filesLoaded');
            });
    }else{
        $state.go('seedbox.files');
    }

// --------------------------------------------- ACTION OPEN FOLDER --------------------------------------------
    $scope.openFolder = function(item){

		if (item.isDirectory){
            $scope.folderActual = item["name"];
            pathActualArray.push(item["name"]);
			$scope.treeActual = item;
			addType($scope.treeActual.fileList);
			$scope.pathActualString = generatePath(pathActualArray, "view");
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
                $scope.folderActual = folderBack.name;
                $scope.pathActualString = generatePath(ArrayPath, "view");
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
		var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "") + name;
		pathEncode = btoa(newPath);
		nameEncode = btoa(name);
		return(api + "file/download/" + id + "/" + pathEncode + "/" + nameEncode);
	};

    $scope.download = function (id, name){
		path = generatePathDownload(id, name);
		window.location.href = path;
	};

    $scope.downloadDirActual = function (){
        var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "");
        pathEncode = btoa(newPath);
		nameEncode = btoa($scope.treeActual.name);
        var path = api + "file/download/" + $scope.torrent._id + "/" + pathEncode + "/" + nameEncode;
        window.location.href = path;
    }

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

// --------------------------------------------- FUNCTION COMMENT --------------------------------------------
    $scope.addComment = function(){
		if ($scope.newComment == "")
			return;
		RequestHandler.post(api + "file/add-comment/" + $scope.torrent._id, {text: $scope.newComment})
			.then(function(result){
				if (result.data.success){
					RequestHandler.get(api + "file/comments/" + $scope.torrent._id, {text: $scope.newComment})
						.then(function(result){
							$scope.torrent.comments = result.data.data;
						});
					$scope.newComment = "";
				}else{
					console.log("Error add comment...");
				}
			});
	};

    $scope.getGradeByUser = function(id){
        var tmp = 0;
        angular.forEach($scope.torrent.grades, function(value, key){
            if (value.user["_id"] === id)
                tmp = value.grade;
        });
        return tmp;
    };

//------------------------------------------------  DRAG & DROP-------------------------------------------------------

    function generatePathUpload(){
        var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "");
        pathEncode = btoa(newPath);
        return(api + "file/upload/" + $scope.torrent._id + "/" + pathEncode);
    };

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
                    url: generatePathUpload(),
                    data: {
                      user: $rootScope.user._id,
                      files: file
                    }
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log(progressPercentage);
                    //$scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
					if (!data.success){
						$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
					}else{
                        $scope.treeActual.fileList.push(data.data[0]);
                        Tools.popMessage("Succes", "L'ajout du fichier a ete effectue");
                    }
                }).error(function (data, status, headers, config) {
					$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
				});
              }
            }
        }
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
        streamMovie: function (id, item) {
            var modalInstance = $modal.open({
                templateUrl: "modalStream.html",
                resolve: {
                 torrent: function () {
                   return $scope.torrent;
                 }
             },
                controller: function ($scope, $http, $modalInstance, RequestHandler, torrent) {

                    var path = 'http://localhost:3000' + generatePathDownload(id, item.name);

                    console.log(path);

                    $scope.stream = {
                        preload: "none",
                        sources: [
                            {src: $sce.trustAsResourceUrl(path), type: item.fileType}
                        ],
                        theme: {
                            url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                        }
                    };

                    console.log($scope.stream);

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
