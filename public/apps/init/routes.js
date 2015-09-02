app.config(function ($routeProvider) {

  $routeProvider
    .when("/", {templateUrl: "index.html", controller: "mainCtrl"})
    .when("/admin", {templateUrl: "/views/admin/index.html", controller: "mainCtrl"})
    .when("/client", {templateUrl: "/views/client/index.html", controller: "mainCtrl"})
    .otherwise({redirectTo: '/'});
});
