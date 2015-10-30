app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/seedbox/dashboard")

    $stateProvider.state('connexion', {
        url: "/connexion",
        templateUrl: "app/indexConnexion.html",
        controller: "connexionCtrl"}
    );
    $stateProvider.state('seedbox', {url: "/seedbox",templateUrl: "app/indexSeedbox.html", controller: "seedboxCtrl"})
    .state('seedbox.dashboard', {
        url: "/dashboard",
        templateUrl: "app/views/dashboard.html",
        controller: "dashboardCtrl",
        access: ["0", "1"]
    })
    .state('seedbox.profile', {
        url: "/profile",
        templateUrl: "app/views/profile.html",
        controller: "profileCtrl",
        access: ["0", "1"],
    })
    .state('seedbox.torrents', {
        url: "/torrents",
        templateUrl: "app/views/torrents.html",
        controller: "torrentsCtrl",
        access: ["0", "1"]
    })
    .state('seedbox.files', {
        url: "/files",
        templateUrl: "app/views/files.html",
        controller: "filesCtrl",
        access: ["0", "1"]
    })
    .state('seedbox.adminUsers', {
        url: "/admin/users",
        templateUrl: "app/views/adminUsers.html",
        controller: "usersCtrl",
        access: ["0"]
    });
});
