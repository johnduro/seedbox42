app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout, $http, $cookies, Lightbox) {

	console.log("filesCtrl");

	$scope.treeBase = '';
	$scope.treeSelected = '';
	$scope.elementsActual = '';
	var pathActualArray = [];
	$scope.pathActual = " / ";
	$scope.pathStreaming = "";
	$scope.typeStreaming = "";
	$scope.itemSelected = false;
	Lightbox.templateUrl = 'app/views/partials/imagesTemplate.html';
	$scope.newComment = "";

	socket.on("newFile", function(data){
		RequestHandler.get(api + "file/all")
			.then(function(result){
				$scope.treeBase = $scope.elementsActual = result.data.data;
				addType($scope.elementsActual);
		});
	});

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.treeBase = $scope.elementsActual = result.data.data;
			console.log($scope.treeBase);
			addType($scope.elementsActual);
	});

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

	function generatePath(newArrayPath){
		pathActualArray = newArrayPath;
		$scope.pathActual = "";
		for(var key in pathActualArray){
			$scope.pathActual = $scope.pathActual + "/ " + pathActualArray[key] + " ";
		}
	}

	function generatePathDownload(id, name){
		var save = false;
		var newPath = "";
		for(var key in pathActualArray){
			if (save){
				newPath = newPath + "/" + pathActualArray[key]
				break;
			}
			if (pathActualArray[key] == $scope.treeSelected.name)
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

	$scope.backPathActual = function(){
		res = $scope.pathActual.trim().split(" / ");
		res.splice(res.length - 1, 1);
		for (var key in res){
			$scope.pathActual = $scope.pathActual + res[key];
		}
	};

	$scope.openFolder = function(value){

		console.log(value);

		if ($scope.treeSelected == ''){
			RequestHandler.get(api + "file/show/" + value)
				.then(function(result){
					if (result.data.data.isDirectory){
						console.log(result);
						$scope.itemSelected = result.data.file;
						$scope.treeSelected = result.data.data;
						$scope.treeSelected.id = value;
						$scope.elementsActual = result.data.data;
						addType($scope.elementsActual.fileList);
						pathActualArray.push(result.data.data.name);
						generatePath(pathActualArray);
					}
				});
		}else if (value.isDirectory){
			$scope.elementsActual = value;
			addType($scope.elementsActual.fileList);
			pathActualArray.push($scope.elementsActual.name);
			generatePath(pathActualArray);
		}else if (value.type == "video"){
			//video.addSource(value.type, generatePathDownload($scope.treeSelected.id, value.name));
			//$scope.typeStreaming = value.fileType;
			//Lightbox.openModal([{url:generatePathDownload($scope.treeSelected.id, value.name)}], 0);
			$scope.pathStreaming = generatePathDownload($scope.treeSelected.id, value.name);
		}else if (value.type == "image"){
			Lightbox.openModal([{url:generatePathDownload($scope.treeSelected.id, value.name)}], 0);
		}
	};


	var folderBack;
	$scope.backFolder = function(folder, path){

		if ($scope.treeBase == $scope.elementsActual){
			return;
		}

		if ($scope.treeSelected == $scope.elementsActual){
			$scope.treeSelected = '';
			$scope.elementsActual = $scope.treeBase;
			pathActualArray = [];
			$scope.pathActual = "/";
			$scope.itemSelected = "";
			return;
		}

		if(folder.path == $scope.elementsActual.path){
			$scope.elementsActual = folderBack;
			generatePath(path);
		}else{
			for (var key in folder.fileList){
				if (folder.fileList[key].isDirectory){
					folderBack = folder;
					path.push(folder.name);
					$scope.backFolder(folder.fileList[key], path);
				}
			}
		}
	};

	$scope.download = function (id, name){
		path = generatePathDownload(id, name);
		window.location.href = path;
	};

	$scope.showInfo = function(item){
		if (item._id == $scope.itemSelected._id){
			$scope.itemSelected = "";
			return;
		}
		RequestHandler.get(api + "file/" + item._id)
			.then(function(result){
				console.log(result);
				console.log(result.data.data);
				$scope.itemSelected = result.data.data;
			});
	};

	$scope.addComment = function(){
		if ($scope.newComment == "")
			return;
		RequestHandler.post(api + "file/add-comment/" + $scope.itemSelected._id, {text: $scope.newComment})
			.then(function(result){
				if (result.data.success){
					RequestHandler.get(api + "file/comments/" + $scope.itemSelected._id, {text: $scope.newComment})
						.then(function(result){
							$scope.itemSelected.comments = result.data.data;
						});
					$scope.newComment = "";
				}else{
					console.log("Error add comment...");
				}
			});
	};

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

	rateFunction = function(rating) {
      console.log('Rating selected: ' + rating);
  };
});
