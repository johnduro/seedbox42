app.controller('filesCtrl', function ($scope, $rootScope, $state, $location, $stateParams, RequestHandler, socket, $timeout, $http, $cookies, Lightbox, Tools) {

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
	console.log($stateParams);

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
			$scope.$broadcast('filesLoaded');//ajout
		});

	$scope.$on('filesLoaded', function () { //ajout
		$timeout(function () {
			// console.log('onononononononon');
			$('.stars').stars();
		}, 0, false);
	});

	function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
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

	$scope.openFile = function(file){
		//console.log(file);
		$location.url('seedbox/file/' + file._id);
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
