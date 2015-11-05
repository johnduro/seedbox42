app.controller("directoryCtrl", function($rootScope, $scope, RequestHandler){

    console.log("directoryCtrl");

    $scope.addDirectory = function(){
        RequestHandler.get(api + "admin/new-directory/" + btoa($scope.sendDir))
            .then(function(result){
                if (result.data.success)
                    newDir = result.data.data;
            });
    };
});
