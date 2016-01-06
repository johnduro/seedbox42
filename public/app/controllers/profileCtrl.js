app.controller("profileCtrl", function($scope, $rootScope, Upload, RequestHandler){

    console.log("profileCtrl");
    $scope.editUser = angular.copy($rootScope.user);

    $rootScope.$watch("user", function(){
        $scope.editUser = angular.copy($rootScope.user);
    });

    $scope.$on("fileSelected", function (event, args) {
        $scope.editUser.avatar = args.file;
    });

    console.log($scope.editUser);

    /*$scope.newUser.avatar = $scope.myFile;
    var fd = new FormData();
    for (var key in $scope.newUser){
        fd.append(key, $scope.newUser[key]);
    }
    RequestHandler.post(api + "users", fd, false, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
        .then(function(result){
            result.data = JSON.parse(result.data);
            if (result.data.success){
                $scope.users.push(result.data.data);
            }
        });*/

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
				console.log(result.data);
			});
	};

});
