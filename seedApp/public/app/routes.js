app.config(function ($stateProvider, $urlRouterProvider) {

/*  $routeProvider
   // .when("/", {templateUrl: "index.html", controller: "mainCtrl"})
    .when("/admin", {templateUrl: "/views/admin/index.html", controller: "mainCtrl"})
    .when("/client", {templateUrl: "/views/client/index.html", controller: "mainCtrl"})
    .otherwise({redirectTo: '/'});*/

    $urlRouterProvider.otherwise("/connexion")

    $stateProvider.state('connexion', {url: "/connexion",templateUrl: "app/indexConnexion.html"});
    $stateProvider.state('seedbox', {url: "/seedbox",templateUrl: "app/indexSeedbox.html"})
    .state('seedbox.dashboard', {
        url: "/dashboard",
        templateUrl: "app/views/dashboard.html",
        controller: function($scope){
            console.log("dashboard");
        }
    });
});
