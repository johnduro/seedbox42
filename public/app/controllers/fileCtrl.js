app.controller("fileCtrl", function($rootScope, $scope, $state, $stateParams, $modal, $http, RequestHandler, $sce, Tools, Upload, Lightbox, toaster){

    $scope.pathActualString = "";
    $scope.folderActual = '';
    var pathActualArray = [];
    Lightbox.templateUrl = 'app/views/partials/imagesTemplate.html';
    $scope.files = { upload: [] };
    var roles = {
		"1" : "user",
		"0": "admin",
	};

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
                $scope.folderActual = result.data.file.name;
                $scope.treeActual = result.data.data;
                addType([$scope.treeActual]);

                if (result.data.data.fileList.length){
                    addType(result.data.data.fileList);
                    $scope.treeBase = result.data.data;
                }else{
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
		}else if (item.type == "image"){
			Lightbox.openModal([{url:generatePathDownload($scope.torrent._id, item.name)}], 0);
		}
	};

// --------------------------------------------- ACTION BACK FOLDER --------------------------------------------
    var folderBack;
    $scope.backFolder = function(){

        if (pathActualArray.length == 0)
            $state.go('seedbox.files');

        pathActualArray.pop();
        $scope.pathActualString = generatePath(pathActualArray, "view");
        if (pathActualArray.length == 0){
            $scope.treeActual = angular.copy($scope.treeBase);
            $scope.folderActual = angular.copy($scope.treeBase.name);
        }else{
            var way = angular.copy($scope.treeBase.fileList);

            var i = 0;
            (function next () {
                var cf = pathActualArray[i++];
                if (!cf)
                    return ;
                for (var idx = 0; idx < way.length; idx++)
                {
                    if (way[idx].name == cf)
                    {
                        $scope.treeActual = way[idx];
                        $scope.folderActual = way[idx].name;
                        next();
                    }
                }
            })();
        }
    }


// --------------------------------------------- FUNCTION DOWNLOAD --------------------------------------------
    function generatePathDownload(id, name){
		var newPath = "";

        newPath += "/" + generatePath(pathActualArray, "") + name;
        if (name == "")
            name = "base";
        console.log("generatePathDownload : newPath", newPath);
		pathEncode = btoa(newPath);
		nameEncode = btoa(name);
		return(api + "file/download/" + id + "/" + pathEncode + "/" + nameEncode);
	};

    $scope.download = function (id, name){
        console.log("download");
		path = generatePathDownload(id, name);
        console.log("download : path -> ", path);
		window.location.href = path;
	};

    function generateDownloadDirActual(){
        var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "");
        pathEncode = btoa(newPath);
		nameEncode = btoa($scope.treeActual.name);
        var path = api + "file/download/" + $scope.torrent._id + "/" + pathEncode + "/" + nameEncode;
        return path;
    };

    $scope.downloadDirActual = function (){
        var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "");
        pathEncode = btoa(newPath);
		nameEncode = btoa($scope.treeActual.name);
        var path = api + "file/download/" + $scope.torrent._id + "/" + pathEncode + "/" + nameEncode;
        console.log("downloadDirActual -> ", path);
        window.location.href = path;
    }

// --------------------------------------------- FUNCTION LOCK FILE --------------------------------------------
    $scope.lockFile = function(item){
        if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
    		RequestHandler.post(api + "file/add-lock/" + item._id)
    			.then(function(result){
    				if (result.data.success)
    					item.isLockedByUser = true;
    				console.log(item);
    			});
        }
	};

	$scope.unlockFile = function(item){
        if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
    		RequestHandler.delete(api + "file/remove-lock/" + item._id, {})
    			.then(function(result){
    				if (result.data.success)
    					item.isLockedByUser = false;
    				console.log(result);
    			});
        }
	};

// --------------------------------------------- FUNCTION COMMENT --------------------------------------------
    $scope.addComment = function(){
		if ($scope.newComment == "")
			return;
        if ($rootScope.config.files['comments-enabled'] == 'all' || $rootScope.config.files['comments-enabled'] == roles[$rootScope.user.role]){
    		RequestHandler.post(api + "file/add-comment/" + $scope.torrent._id, {text: $scope.newComment})
    			.then(function(result){
    				if (result.data.success){
    					RequestHandler.get(api + "file/comments/" + $scope.torrent._id, {text: $scope.newComment})
    						.then(function(result){
    							$scope.torrent.comments = result.data.data;
                                $rootScope.$broadcast('filesLoaded');
    						});
    					$scope.newComment = "";
    				}else{
    					console.log("Error add comment...");
    				}
    			});
        }else{
            toaster.pop('error', "Error", "You can't comment on this file.", 5000);
        }
	}; 

    $scope.deleteComment = function(index, id){
        RequestHandler.delete(api + "file/remove-comment/" + $scope.torrent._id, {commentId: id})
            .then(function(result){
                if (result.data.success){
                    $scope.torrent.comments.splice(index, 1);
                }else{
                    console.log("Error delete comment...");
                }
            });
    }

    $scope.getGradeByUser = function(id){
        var tmp = 0;
        angular.forEach($scope.torrent.grades, function(value, key){
            if (value.user["_id"] === id)
                tmp = value.grade;
        });
        return tmp;
    };

    $scope.allowRate = function () {
        if ($rootScope.config.files['grades-enabled'] == 'all' || $rootScope.config.files['grades-enabled'] == roles[$rootScope.user.role])
            return true;
        return false;
    };

//------------------------------------------------  DRAG & DROP-------------------------------------------------------

    function generatePathUpload(){
        var newPath = "";
        newPath += "/" + generatePath(pathActualArray, "");
        pathEncode = btoa(newPath);
        return(api + "file/upload/" + $scope.torrent._id + "/" + pathEncode);
    };

	$scope.$watch('files.upload', function () {
        $scope.upload($scope.files.upload);
    });
    $scope.$watch('file', function () {
        console.log($scope.files);
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = '';

    $scope.upload = function (files) {
        console.log("upload");
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
                        toaster.pop('error', "Error !", "L'ajout du nouveau fichier a echoue...", 5000);
					}else{
                        $scope.treeActual.fileList.push(data.data[0]);
                        addType($scope.treeActual.fileList);
                        toaster.pop('success', "Succes !", "L'ajout du fichier a ete effectue", 5000);
                    }
                }).error(function (data, status, headers, config) {
					toaster.pop('error', "Error !", "L'ajout du nouveau fichier a echoue...", 5000);
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
                    var path = "";

                    if (torrent.fileType != "folder"){
                        path = generateDownloadDirActual();
                        console.log("not folder");
                    }else{
                        path = generatePathDownload(id, item.name);
                    }

                    $scope.getClass = function(){
                        if (item.type == "audio"){
                            return "videogular-container audio";
                        }else{
                            return "videogular-container";
                        }
                    };

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
