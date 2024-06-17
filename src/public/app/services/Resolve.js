app.factory("Resolve", function ($rootScope, $http, RequestHandler, socket, $timeout, $modal, $q, $location, $state, $cookies) {

    var connection = function(){
        var defer = $q.defer();

        $rootScope.token = localStorage.getItem("token");

        if (!$rootScope.token){
            defer.reject("badConnection");
        }else{
            defer.resolve();
            $cookies.put("token", $rootScope.token);
            socket.connection();
        }

        return defer.promise;
    };

    var getConfig = function (force){
        force = typeof force !== 'undefined' ? force : false;

        var defer = $q.defer();
        if ("config" in $rootScope && !force){
            defer.resolve($rootScope.config);
        }else{
            RequestHandler.get(api + "admin/settings")
                .then(function(result){
                    if (result.data.success)
					{
                        $rootScope.config = result.data.data;
						$rootScope.ttVersion = result.data.version;
                        defer.resolve(result.data.data);
					}else{
                        defer.reject(false);
                    }

                });
        }
        return defer.promise;
    };

    var getUser = function (){
        var defer = $q.defer();
        if ("user" in $rootScope){
            defer.resolve($rootScope.user);
        }else{
            RequestHandler.get(api + "users/profile")
                .then(function(result){
                    $rootScope.user = result.data.data;
                    defer.resolve($rootScope.user);
                });
        }
        return defer.promise;
    };

    return {
        connection: connection,
        getConfig: getConfig,
        getUser: getUser,
    };

});
