//Handler qui gere les appels ajax
app.factory('RequestHandler', ['$http', '$q', '$log', '$rootScope', '$location',
    function ($http, $q, $log, $rootScope, $location) {

        $rootScope.transaction = {};

        return {
            post: function (url, data, transform, config) {
                transform = (transform == false ? false : true);
                config = (config == false ? {} : config);
                var promise = $q.defer();
                if (!transform) {
                    config.transformResponse = function (data) {
                        return data;
                    };
                }
                var http = $http.post(url, data, config);

                http.success(function (data, status, headers, config) {
                    promise.resolve({"data": data, "status": status});
                    $rootScope.$broadcast('dataloaded');
                });

                http.error(function (data, status) {
                    //Gestion des retours en erreur
                    if (data.status == 422 && typeof data.detail != "undefined") {
                        $rootScope.transaction.msg = data.detail;
                        $log.debug(data.detail);
                    }
                    if (status == 403){
                        localStorage.clear();
                        $location.url('connexion');
                    }
                    promise.resolve({"data": data, "status": status});

                });
                return promise.promise;
            },
            get: function (url) {
                var promise = $q.defer();
                $http.get(url).
                        success(function (data, status, headers, config) {
                            promise.resolve({"data": data, "status": status});
                            $rootScope.$broadcast('dataloaded');
                        }).
                        error(function (data, status, headers, config) {
                            //Gestion des retours en erreur
                            if (data.status == 422 && typeof data.detail != "undefined") {
                                $rootScope.transaction.msg = data.detail;
                                $log.debug(data.detail);
                            }
                            if (status == 403){
                                localStorage.clear();
                                $location.url('connexion');
                            }
                            promise.resolve({"data": data, "status": status});
                        });
                return promise.promise;
            },
            getConfig: function () {
                var promise = $q.defer();
                if ("config" in $rootScope){
                    return $rootScope.config;
                }
                $http.get("/admin/settings").
                        success(function (data, status, headers, config) {
                            console.log(data);
                            $rootScope.config = data.data;
                            promise.resolve(data.data);
                        }).
                        error(function (data, status, headers, config) {
                            //Gestion des retours en erreur
                            if (data.status == 422 && typeof data.detail != "undefined") {
                                $rootScope.transaction.msg = data.detail;
                                $log.debug(data.detail);
                            }
                            if (status == 403){
                                localStorage.clear();
                                $location.url('connexion');
                            }
                            promise.resolve({"data": data, "status": status});
                        });
                return promise.promise;
            },
            put: function (url, data, transform, config) {
                transform = (transform == false ? false : true);
                config = (config == false ? {} : config);
                var promise = $q.defer();
                if (!transform) {
                    config.transformResponse = function (data) {
                        return data;
                    };
                }
                var http = $http.put(url, data, config);

                http.success(function (data, status, headers, config) {
                    promise.resolve({"data": data, "status": status});
                    $rootScope.$broadcast('dataloaded');
                });

                http.error(function (data, status) { // called asynchronously if an error occurs
                    //Gestion des retours en erreur
                    if (data.status == 422 && typeof data.detail != "undefined") {
                        $rootScope.transaction.msg = data.detail;
                        $log.debug(data.detail);
                    }
                    if (status == 403){
                        localStorage.clear();
                        $location.url('connexion');
                    }
                    $log.error(status);
                    promise.resolve({"data": data, "status": status});

                });
                return promise.promise;
            },
            delete: function (url, data) {
                //$http.defaults.headers.common['Accept'] = 'application/json';
                //$http.defaults.headers.common['Content-Type'] = 'application/json';
                var promise = $q.defer();
                var config = {
                    method: "DELETE",
                    url: url,
                    data: data,
                    headers: {"Content-Type": "application/json;charset=utf-8"}
                };
                var http = $http(config);
                //var http = $http.delete(url);
                http.success(function (data, status, headers, config) {
                    promise.resolve({"data": data, "status": status});
                    $rootScope.$broadcast('dataloaded');
                });
                http.error(function (data, status) { // called asynchronously if an error occurs
                    //Gestion des retours en erreur
                    if (data.status == 422 && typeof data.detail != "undefined") {
                        $rootScope.transaction.msg = data.detail;
                        $log.debug(data.detail);
                    }
                    if (status == 403){
                        localStorage.clear();
                        $location.url('connexion');
                    }
                    $log.error(status);
                    promise.resolve({"data": data, "status": status});

                });
                return promise.promise;
            }
        };
    }
]);
