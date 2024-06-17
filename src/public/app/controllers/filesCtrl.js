app.controller('filesCtrl', function ($scope, $rootScope, $state, $location, $filter, $stateParams, $window, RequestHandler, socket, $timeout, $http, $cookies, Lightbox, Tools, toaster) {

	console.log("filesCtrl");

	$scope.treeSelected = '';
	$scope.elementsActual = [];
	$scope.pathActual = " / ";
	$scope.itemSelected = false;
	var pageSize = 50;
	var pathActualArray = [];
	var requestApi = "file";

	$scope.listLimit = 50;
	// var cols= ["type", "name", "size", "isLocked", ];

	socket.on("newFile", function(data){
		RequestHandler.get(api + "file/all")
			.then(function(result){
				$scope.elementsActual = result.data.data;
				addType($scope.elementsActual);
		});
	});

	$scope.loadMore = function(){
		$scope.listLimit += 20;
	};

	RequestHandler.get(api + (!$stateParams.sort ? $stateParams.sort = "file" : ('dashboard/' + $stateParams.sort)) + "/all")
		.then(function(result){
			$scope.allElements = result.data.data;
			addType($scope.allElements);
			//$scope.elementsActual = result.data.data.slice(0, pageSize);
			$scope.elementsActual = result.data.data;
			$scope.pageMax = Math.ceil(result.data.data.length/pageSize);
			$scope.pageActual = 1;
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

	$scope.getOrderBy = function () {
		if ($scope.sortColumn == "size" || $scope.sortColumn == "isLocked" || $scope.sortColumn == "downloads" || $scope.sortColumn == "averageGrade" || $scope.sortColumn == "commentsNbr")
		{
			if ($scope.reverse)
				return [$scope.sortColumn];
			else
				return ['-' + $scope.sortColumn];
		}
		else
		{
			if ($scope.reverse)
				return ['-' + $scope.sortColumn];
			else
				return [$scope.sortColumn];
		}
	};

	$scope.order = function(item){
		$scope.reverse = ($scope.sortColumn === item) ? !$scope.reverse : false;
		setClassSort();
		$scope.sortColumn = item;
	};

	$scope.$watch('research', function(){
		if ($scope.research == ""){
			$scope.setPageActual();
			return;
		}
		$scope.elementsActual = $filter('filter')($scope.allElements, {name: $scope.research});
	});

// --------------------------------------------- FUNCTION PAGINATE --------------------------------------------
	$scope.setPageActual = function(){
		$scope.elementsActual = $scope.allElements.slice(($scope.pageActual-1)*pageSize, ($scope.pageActual-1)*pageSize+pageSize);
		$window.scrollTo(0, 0);
	};

	$scope.pagePast = function(){
		if ($scope.pageActual == 1)
			return;
		$scope.pageActual--;
		$scope.setPageActual();
	};
	$scope.pageNext = function(){
		if ($scope.pageActual == $scope.pageMax)
			return;
		$scope.pageActual++;
		$scope.setPageActual();
	};



// --------------------------------------------- FUNCTION LOCK --------------------------------------------
	$scope.lockFile = function(item){
		if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
			RequestHandler.post(api + "file/add-lock/" + item._id)
				.then(function(result){
					if (result.data.success)
						item.isLockedByUser = true;
				});
		}
	};

	$scope.unlockFile = function(item){
		if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
			RequestHandler.delete(api + "file/remove-lock/" + item._id, {})
				.then(function(result){
					if (result.data.success)
						item.isLockedByUser = false;
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
