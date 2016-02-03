app.controller("settingsCtrl", function($rootScope, $scope, RequestHandler, toaster, Tools){
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
		if ($scope.settings['dashboard']['panels'])
		{
			$scope.settings['dashboard']['panels'].sort(function (it1, it2) {
				if (it1.order < it2.order)
					return -1;
				else if (it1.order > it2.order)
					return 1;
				return 0;
			});
		}
    };

    RequestHandler.get(api + "admin/settings")
        .then(function(result1){
            if (result1.data.success){
                RequestHandler.get(api + "admin/settings-default")
                    .then(function(result2){
                        $scope.settings = result1.data.data;
                        $scope.settingsDefault = result2.data.data;
                        sortSettings();
                    });

            }
        });

    $scope.updatePart = function(part){
        console.log($scope.settings[part]);
        RequestHandler.put(api + "admin/settings/" + part, $scope.settings[part])
            .then(function(result){
                if (result.data.success){
                    toaster.pop('success', "Success", result.data.message, 5000);
                    Tools.getConfig(true);
                } else {
                    toaster.pop('error', "Error", result.data.message, 5000);
                }
            });
    };

});
