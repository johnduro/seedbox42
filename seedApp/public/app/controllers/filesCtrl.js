
app.controller('filesCtrl', function ($scope, $rootScope, RequestHandler, socket, $timeout) {

	console.log("filesCtrl");

	$scope.treeBase = '';
	$scope.treeSelected = '';
	$scope.elementsActual = '';

	function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
		});
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
				});
		}else if (value){
			$scope.elementsActual = value;
			addType($scope.elementsActual.fileList);
		}
	};


	var folderBack;
	$scope.backFolder = function(folder){

		if ($scope.treeSelected == $scope.elementsActual){
			$scope.treeSelected = '';
			$scope.elementsActual = $scope.treeBase;
			return;
		}

		if(folder.path == $scope.elementsActual.path){
			$scope.elementsActual = folderBack;
		}else{
			for (var key in folder.fileList){
				if (folder.fileList[key].isDirectory){
					folderBack = folder;
					$scope.backFolder(folder.fileList[key]);
				}
			}
		}
	};
});
