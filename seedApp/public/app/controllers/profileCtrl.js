app.controller("profileCtrl", function($scope, $rootScope, Upload){

    console.log("profileCtrl");
    console.log($rootScope.user);

    if (!("avatar" in $rootScope)){
        $rootScope.user.avatar = "undefined";
    }

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });

    $scope.upload = function (files) {

        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (!file.$error) {
                Upload.upload({
                    url: '/users',
                    data: {
                      avatar: file,
                      login: $rootScope.user.login
                    }
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
					/*if (!data[0].success){
						$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
					}*/
                }).error(function (data, status, headers, config) {
					$rootScope.msgInfo("Error !", "L'ajout du nouveau torrent a echoue...");
				});
              }
            }
        }
    };

});
