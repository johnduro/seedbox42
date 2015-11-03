app.controller("profileCtrl", function($scope, $rootScope, Upload){

    console.log("profileCtrl");
    console.log($rootScope.user);

    $scope.editUser = angular.copy($rootScope.user);
    console.log($scope.editUser);

    $scope.updateUser = function(){
        var send = {};

        angular.forEach($rootScope.user, function(item1, index) {
            if ($rootScope.user[index] != $scope.editUser[index]){
                send[index] = $scope.editUser[index];
            }
        });
        console.log($rootScope.user);
        console.log(send);
		/*RequestHandler.put(api + "users/" + $rootScope.user._id, $scope.selectUser)
			.then(function(result){
				console.log(result);
			});*/
	};

    /*if (!("avatar" in $rootScope)){
        $rootScope.user.avatar = "undefined";
    }*/
});
