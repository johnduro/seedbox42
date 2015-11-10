app.controller("fileCtrl", function($rootScope, $scope, $state, $stateParams, RequestHandler){

    $scope.pathActualString = "";
    var pathActualArray = [];

    console.log($rootScope.states);

// --------------------------------------------- FUNCTION PRIVATE --------------------------------------------
    function FileConvertSize(aSize){
		aSize = Math.abs(parseInt(aSize, 10));
		var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
		for(var i=0; i<def.length; i++){
			if(aSize<def[i][0])
				return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
		}
	}

    function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = FileConvertSize(value.size);
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
                $scope.torrent.sizeConvert = FileConvertSize($scope.torrent.size);
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

});
