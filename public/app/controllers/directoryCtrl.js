app.controller("directoryCtrl", function($rootScope, $scope, RequestHandler, Tools){

    console.log("directoryCtrl");

    $scope.sendDir = "/Users/Alexis/Downloads";
    $scope.tree = "";
    var indexSelected = [];

    $scope.selectItem = function(index){
        var a;
        // if ((a = indexSelected.indexOf(index)))  // NULL !
        if ((a = indexSelected.indexOf(index)) == -1)
            indexSelected.push(index);
        else
            indexSelected.splice(a, 1);
        console.log(indexSelected);
    };

    $scope.searchDirectory = function(){
        RequestHandler.get(api + "admin/new-directory/" + btoa($scope.sendDir))
            .then(function(result){
                if (result.data.success)
				{
					console.log("result::get:: ", result.data.data);
                    $scope.tree = result.data.data;
				}
            });
    };

    $scope.addDirectory = function(){
        var send = [];
        if (indexSelected.length)
		{
            // for (var key in indexSelected){ //SERIEUSEMENT ?!
            //     send.push($scope.tree[key]);
            // }
			for (var i = 0; i < indexSelected.length; i++)
			{
				var key = indexSelected[i];
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
    }
});
