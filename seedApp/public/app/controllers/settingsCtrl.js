app.controller("settingsCtrl", function($rootScope, $scope, RequestHandler){
    console.log("settingsCtrl");

    $scope.sendDir = "";
    $scope.newDir = "";

    function merge_options(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    function sortSettings (){
        var boolean = {};
        var others = {};

        for (var settingskey in $scope.settings){
            boolean = {};
            others = {};
            for (var elementkey in $scope.settings[settingskey]){
                if ($scope.settings[settingskey][elementkey] === true || $scope.settings[settingskey][elementkey] === false)
                    boolean[elementkey] = $scope.settings[settingskey][elementkey];
                else
                    others[elementkey] = $scope.settings[settingskey][elementkey];
            }
            $scope.settings[settingskey] = jQuery.extend(boolean, others);
        }
    };

    RequestHandler.get(api + "admin/settings")
        .then(function(result){
            if (result.data.success){
                $scope.settings = result.data.data;
                sortSettings();
            }
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
