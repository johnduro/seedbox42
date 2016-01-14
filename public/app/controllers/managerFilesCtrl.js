app.controller("managerFilesCtrl", function($rootScope, $scope,$filter, Tools, RequestHandler){
    console.log("managerFiles");
	$scope.itemSelected = [];
	$scope.checkboxAll = false;
	$scope.search;

	RequestHandler.get(api + "file/all")
		.then(function(result){
			$scope.elementsActual = result.data.data;
			console.log($scope.treeBase);
			addType($scope.elementsActual);
			// $rootScope.$broadcast('filesLoaded');
		});

	function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
		});
	};

	$scope.lockFile = function(item){ //GENERALISER DOUBLON DANS FILES
		RequestHandler.post(api + "file/add-lock/" + item._id)
			.then(function(result){
				if (result.data.success)
					item.isLockedByUser = true;
				console.log(item);
			});
	};

	$scope.unlockFile = function(item){ //GENERALISER DOUBLON DANS FILES
		RequestHandler.delete(api + "file/remove-lock/" + item._id, {})
			.then(function(result){
				if (result.data.success)
					item.isLockedByUser = false;
				console.log(result);
			});
	};

	$scope.openFile = function(file){
		//console.log(file);
		$location.url('seedbox/file/' + file._id);
	};

	$scope.checkboxSwitch = function (id) {
		var index = $scope.itemSelected.indexOf(id);
		if (index >= 0)
			$scope.itemSelected.splice(index, 1);
		else
			$scope.itemSelected.push(id);
	};

	$scope.selectAll = function() {
		if ($scope.checkboxAll)
		{
			var itemsFilter = $filter('filter')($scope.elementsActual, { name: $scope.search });
			// console.log(itemsFilter);
			Tools.setAllItems(itemsFilter, "checkbox", true);
			$scope.itemSelected = Tools.getElementForMatchValue(itemsFilter, "_id", "checkbox", true);
		}
		else
		{
			Tools.setAllItems($scope.elementsActual, "checkbox", false);
			$scope.itemSelected = [];
		}
	};

});
