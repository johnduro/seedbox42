app.controller("directoryCtrl", function($rootScope, $scope, RequestHandler){

    console.log("directoryCtrl");

    $scope.sendDir = "/Users/Alexis/Downloads";
    $scope.tree = "";
    var indexSelected = [];

    $scope.selectItem = function(index){
        var a;
        if ((a = indexSelected.indexOf(index)))
            indexSelected.push(index);
        else
            indexSelected.splice(a, 1);
        console.log(indexSelected);
    };

    $scope.searchDirectory = function(){
        RequestHandler.get(api + "admin/new-directory/" + btoa($scope.sendDir))
            .then(function(result){
                if (result.data.success)
                    $scope.tree = result.data.data;
            });
    };

    $scope.addDirectory = function(){
        var send = [];
        if (indexSelected.length){
            for (var key in indexSelected){
                send.push($scope.tree[key]);
            }
            RequestHandler.put(api + "admin/new-directory", send)
                .then(function(result){
                    console.log(result);
                });
        }
    }
});
