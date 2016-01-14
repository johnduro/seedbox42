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
		});

	function addType(list){
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
		});
	};

	$scope.hardUnlockSelected = function () {
		if ($scope.itemSelected.length > 0)
		{
			RequestHandler.put(api + "file/hard-remove-all-lock/", { toUnlock: $scope.itemSelected })
				.then(function (result) {
					if (result.data.success)
					{
						angular.forEach($scope.elementsActual, function (file) {
							if (result.data.data.indexOf(file._id) >= 0)
							{
								file.isLockedByUser = 0;
								file.isLocked = 0;
							}
						});
					}
				});
		}
	};


	$scope.deleteSelected = function () {
		console.log('DELETE SELECTED :: ', $scope.itemSelected);
		if ($scope.itemSelected.length > 0)
		{
			RequestHandler.put(api + "file/delete-all/", { toDelete: $scope.itemSelected })
				.then(function (result) {
					if (result.data.success)
					{
						RequestHandler.get(api + "file/all")
							.then(function(result){
								$scope.elementsActual = result.data.data;
								console.log($scope.treeBase);
								addType($scope.elementsActual);
								$scope.itemSelected = [];
							});
					}
				});
		}
	};

	$scope.deleteUnlocked = function () {
		var toDelete = [];
		angular.forEach($scope.elementsActual, function (file) {
			if (!(file.isLocked))
				toDelete.push(file._id);
		});
		RequestHandler.put(api + "file/delete-all/", { toDelete: toDelete })
			.then(function (result) {
				if (result.data.success)
				{
					RequestHandler.get(api + "file/all")
						.then(function(result){
							$scope.elementsActual = result.data.data;
							console.log($scope.treeBase);
							addType($scope.elementsActual);
							$scope.itemSelected = [];
						});
				}
			});
		console.log('DELETE UNLOCKED :: ', toDelete);
	};

	$scope.lockFile = function(item){ //GENERALISER DOUBLON DANS FILES
		RequestHandler.post(api + "file/add-lock/" + item._id)
			.then(function(result){
				if (result.data.success)
				{
					item.isLockedByUser = true;
					item.isLocked = true;
				}
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
