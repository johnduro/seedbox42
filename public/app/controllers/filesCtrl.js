app.controller('filesCtrl', function ($scope, $rootScope, $state, $location, $stateParams, RequestHandler, socket, $timeout, $http, $cookies, Lightbox, Tools, toaster) {

	console.log("filesCtrl");

	$scope.treeSelected = '';
	$scope.elementsActual = '';
	var pathActualArray = [];
	$scope.pathActual = " / ";
	$scope.itemSelected = false;
	var requestApi = "file";
	console.log($stateParams);
	var roles = {
		"1" : "user",
		"0": "admin",
	};

	socket.on("newFile", function(data){
		RequestHandler.get(api + "file/all")
			.then(function(result){
				//toaster.pop('success', "Nouveau fichier !", "Le nouveau fichier a ete ajoute a la liste.", 5000);
				$scope.elementsActual = result.data.data;
				addType($scope.elementsActual);
		});
	});

	RequestHandler.get(api + (!$stateParams.sort ? $stateParams.sort = "file" : ('dashboard/' + $stateParams.sort)) + "/all")
		.then(function(result){
			$scope.elementsActual = result.data.data;
			addType($scope.elementsActual);
			$rootScope.$broadcast('filesLoaded');
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
	};

	function generatePathDownload(id, name){
		pathEncode = btoa("/");
		nameEncode = btoa(name);
		return(api + "file/download/" + id + "/" + pathEncode + "/" + nameEncode);
	};

	$scope.openFile = function(file){
		//console.log(file);
		$location.url('seedbox/file/' + file._id);
	};

	$scope.download = function (id, name){
		path = generatePathDownload(id, name);
		window.location.href = path;
	};

// --------------------------------------------- FUNCTION SORT --------------------------------------------
	if ($stateParams.sort == 'file'){
		$scope.sortColumn = 'createdAt';
		$scope.reverse = true;
		setClassSort();
	}

	function setClassSort (){
		if ($scope.reverse){
			$scope.classSort = "fa fa-sort-asc";
		}else{
			$scope.classSort = "fa fa-sort-desc";
		}
	}

	$scope.order = function(item){
		$scope.reverse = ($scope.sortColumn === item) ? !$scope.reverse : false;
		setClassSort();
		$scope.sortColumn = item;
	}

// --------------------------------------------- FUNCTION LOCK --------------------------------------------
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

	$scope.showCreator = function () {
		if ($rootScope.config.files['show-creator'] == 'all' || $rootScope.config.files['show-creator'] == roles[$rootScope.user.role])
			return true;
		return false;
	};

	rateFunction = function(rating) {
      console.log('Rating selected: ' + rating);
  };
});
