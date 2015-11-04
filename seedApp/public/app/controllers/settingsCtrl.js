app.controller("settingsCtrl", function($rootScope, $scope, RequestHandler){
    console.log("settingsCtrl");

    $scope.sendDir = "";
    $scope.newDir = "";

    RequestHandler.get(api + "admin/settings")
        .then(function(result){
            if (result.data.success)
                $scope.settings = result.data.data;
            console.log($scope.settings.torrents['add-torrent-enabled']);
        });

    $scope.updatePart = function(part){
        console.log($scope.settings[part]);
        RequestHandler.put(api + "admin/settings/" + part, $scope.settings[part])
            .then(function(result){
                if (result.data.success)
                    $scope.settings[part] = result.data.data;
                console.log(result);
            });
    };

    $scope.addDirectory = function(){
        RequestHandler.get(api + "admin/new-directory/" + btoa($scope.sendDir))
            .then(function(result){
                if (result.data.success)
                    newDir = result.data.data;
            });
    };
});
