app.controller("directoryCtrl", function($rootScope, $scope, RequestHandler, Tools, toaster){

    console.log("directoryCtrl");

    $scope.sendDir = "";
    $scope.tree = "";
    $scope.indexSelected = [];
	$scope.checkbox = { all: false };


    $scope.searchDirectory = function(){
        toaster.pop('info', "Info", "Search in path", 5000);
        RequestHandler.get(api + "admin/new-directory/" + btoa($scope.sendDir))
            .then(function(result){
                if (result.data.success)
				{
					console.log("result::get:: ", result.data.data);
                    $scope.tree = result.data.data;
					addType($scope.tree);
				}else {
				    toaster.pop('error', "Error", "Path do not exist.", 5000);
				}
            });
    };

	function addType (list) {
		angular.forEach(list, function(value, key){
			res = value.fileType.split("/");
			value.type = res[0];
			value.sizeConvert = Tools.FileConvertSize(value.size);
			value.checkbox = false;
		});
	};

    $scope.selectItem = function(index){
		// console.log($scope.tree[index]);
        var a;
        if ((a = $scope.indexSelected.indexOf(index)) == -1)
            $scope.indexSelected.push(index);
        else
            $scope.indexSelected.splice(a, 1);
        console.log($scope.indexSelected);
    };

	$scope.selectAll = function () {
		console.log('here :: ', $scope.checkbox.all);
		if ($scope.checkbox.all)
		{
			Tools.setAllItems($scope.tree, "checkbox", true);
			var treeLength = $scope.tree.length;
			$scope.indexSelected = [];
			for (var i = 0; i < treeLength; i++)
			{
				if ($scope.tree[i].checkbox)
					$scope.indexSelected.push(i);
			}
		}
		else
		{
			Tools.setAllItems($scope.tree, "checkbox", false);
			$scope.indexSelected = [];
		}
	};

    $scope.addDirectory = function(){
        var send = [];
        if ($scope.indexSelected.length)
		{
			for (var i = 0; i < $scope.indexSelected.length; i++)
			{
				var key = $scope.indexSelected[i];
				send.push($scope.tree[key]);
			}
			console.log('tree::put:: ', $scope.tree);
			console.log('send::put:: ', send);
            RequestHandler.put(api + "admin/new-directory", send)
                .then(function(result){
                    console.log(result.data);
                    if (result.data.success)
                        console.log(result);
                    else
                        console.log("ss");
                    Tools.popMessage("Erreur", result.data.message);
                });
        }
    };
});
