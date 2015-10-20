app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	$scope.treeBase = '';
	$scope.treeSelected = '';
	$scope.elementsActual = '';
	var pathActualArray = [];
	$scope.pathActual = " / ";


	function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
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

		if ($scope.treeSelected == ''){
			RequestHandler.get(api + "file/show/" + value)
				.then(function(result){
					$scope.treeSelected = result.data.data;
					$scope.elementsActual = result.data.data;
					addType($scope.elementsActual.fileList);
					pathActualArray.push(result.data.data.name);
					generatePath(pathActualArray);
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
});
