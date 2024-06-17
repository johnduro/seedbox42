app.controller("profileCtrl", function($scope, $rootScope, $filter, $location, Tools, Upload, RequestHandler){

	$scope.itemSelected = [];
	$scope.checkboxAll = false;
	$scope.search;
    $scope.editUser = angular.copy($rootScope.user);

    $rootScope.$watch("user", function(){
        $scope.editUser = angular.copy($rootScope.user);
    });

    $scope.$on("fileSelected", function (event, args) {
        $scope.editUser.avatar = args.file;
    });

	function getUserLockedFiles (user) {
		RequestHandler.get(api + "file/user-locked/" + user._id)
			.then(function(result) {
	            if (result.data.success){
	                $scope.userLockedFiles = result.data.data;
					addType($scope.userLockedFiles);
					$rootScope.$broadcast('filesLoaded');
	            }
			});
	};

	getUserLockedFiles($rootScope.user);

	function addType (list) {
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
			value.checkbox = false;
		});
	};

	$scope.unlockSelected = function () {
		if ($scope.itemSelected.length > 0)
		{
			RequestHandler.put(api + "file/remove-all-user-lock/", { toUnlock: $scope.itemSelected })
				.then(function (result) {
					if (result.data.success)
					{
						$scope.userLockedFiles.forEach(function (file) {
							if (result.data.data.indexOf(file._id) >= 0)
								file.isLockedByUser = 0;
						});
					}
				});
		}
	};

	$scope.lockFile = function(item){ //GENERALISER DOUBLON DANS FILES
		if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
			RequestHandler.post(api + "file/add-lock/" + item._id)
				.then(function(result){
					if (result.data.success)
						item.isLockedByUser = true;
				});
		}
	};

	$scope.unlockFile = function(item){ //GENERALISER DOUBLON DANS FILES
		if ($rootScope.config.files['lock-enabled'] == 'all' || $rootScope.config.files['lock-enabled'] == roles[$rootScope.user.role]){
			RequestHandler.delete(api + "file/remove-lock/" + item._id, {})
				.then(function(result){
					if (result.data.success)
						item.isLockedByUser = false;
				});
		}
	};

	$scope.download = function (id, name){ //GENERALISER ??
		path = api + "file/download/" + id + "/" + btoa('/') + "/" + btoa(name);
		window.location.href = path;
	};

	$scope.openFile = function(file){
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
			var itemsFilter = $filter('filter')($scope.userLockedFiles, { name: $scope.search });
			Tools.setAllItems(itemsFilter, "checkbox", true);
			$scope.itemSelected = Tools.getElementForMatchValue(itemsFilter, "_id", "checkbox", true);
		}
		else
		{
			Tools.setAllItems($scope.userLockedFiles, "checkbox", false);
			$scope.itemSelected = [];
		}
	};

    $scope.updateUser = function(){
        var send = {};

        angular.forEach($rootScope.user, function(item1, index) {
            if ($rootScope.user[index] != $scope.editUser[index]){
                send[index] = $scope.editUser[index];
            }
        });

        var fd = new FormData();
        for (var key in send){
            fd.append(key, send[key]);
        }

		RequestHandler.put(api + "users/" + $rootScope.user._id, fd, false, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
			.then(function(result){
                result.data = JSON.parse(result.data);
                if (result.data.success){
                    $rootScope.user = result.data.data;
                }
			});
	};

});
