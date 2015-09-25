app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/seedbox/dashboard")

    $stateProvider.state('connexion', {url: "/connexion",templateUrl: "app/indexConnexion.html"});
    $stateProvider.state('seedbox', {url: "/seedbox",templateUrl: "app/indexSeedbox.html", controller: "seedboxCtrl"})
    .state('seedbox.dashboard', {
        url: "/dashboard",
        templateUrl: "app/views/dashboard.html",
        controller: "dashboardCtrl"
    });
});
