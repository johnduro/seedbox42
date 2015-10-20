app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	$scope.treeBase = '';
	$scope.treeSelected = '';
	$scope.elementsActual = '';
	var pathActualArray = [];
	$scope.pathActual = " / ";

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

	$scope.backPathActual = function(){
		res = $scope.pathActual.trim().split(" / ");
		res.splice(res.length - 1, 1);
		for (var key in res){
			$scope.pathActual = $scope.pathActual + res[key];
		}
	};

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.treeBase = $scope.elementsActual = result.data.data;
			addType($scope.elementsActual);
	});

	$scope.openFolder = function(value){

		console.log(value);

		if ($scope.treeSelected == ''){
			RequestHandler.get(api + "file/show/" + value)
				.then(function(result){
					if (result.data.data.isDirectory){
						console.log(result);
						$scope.treeSelected = result.data.data;
						$scope.treeSelected.id = value;
						$scope.elementsActual = result.data.data;
						addType($scope.elementsActual.fileList);
						pathActualArray.push(result.data.data.name);
						generatePath(pathActualArray);
					}
				});
		}else if (value){
			$scope.elementsActual = value;
			addType($scope.elementsActual.fileList);
			pathActualArray.push($scope.elementsActual.name);
			generatePath(pathActualArray);
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
		var send = {
			'path': "",
			'name': name
		};

		var save = false;
		for(var key in pathActualArray){
			if (save){
				send.path = send.path + "/" + pathActualArray[key]
				break;
			}
			if (pathActualArray[key] == $scope.treeSelected.name)
				save = true;
		}
		if (save){
			send.path += "/" + name;
		}else{
			send.path = "/";
		}
		console.log(send);
		RequestHandler.get(api + "file/download/" + id, send)
			.then(function(result){
				console.log(result);
			});
	}
});
