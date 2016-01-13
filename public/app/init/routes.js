app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/seedbox/dashboard")

    $stateProvider.state('connexion', {
        url: "/connexion",
        templateUrl: "app/indexConnexion.html",
        controller: "connexionCtrl"}
    );
    $stateProvider
    .state('seedbox', {
        url: "/seedbox",
        templateUrl: "app/indexSeedbox.html",
        controller: "seedboxCtrl"
    })
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
    .state('seedbox.file', {
        url: "/file/:file",
        templateUrl: "app/views/file.html",
        controller: "fileCtrl",
        access: ["0", "1"]
    })
    .state('seedbox.files', {
        url: "/files",
        templateUrl: "app/views/files.html",
        controller: "filesCtrl",
        access: ["0", "1"]
    })

// ------------------------------------------- ADMIN SECTION ---------------------------------------------------------
    .state('seedbox.adminUsers', {
        url: "/admin/users",
        templateUrl: "app/views/adminUsers.html",
        controller: "usersCtrl",
        access: ["0"]
    })
    .state('seedbox.adminSettings', {
        url: "/admin/settings",
        templateUrl: "app/views/adminSettings.html",
        controller: "settingsCtrl",
        access: ["0"]
    })
    .state('seedbox.adminManagerFiles', {
        url: "/admin/managerFiles",
        templateUrl: "app/views/adminManagerFiles.html",
        controller: "managerFilesCtrl",
        access: ["0"]
    })
    .state('seedbox.adminDirectory', {
        url: "/admin/directory",
        templateUrl: "app/views/adminDirectory.html",
        controller: "directoryCtrl",
        access: ["0"]
    });
});
