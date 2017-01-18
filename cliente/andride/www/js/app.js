

angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives','starter.services', 'ngCordova', 'ngSails','ionic-sidemenu']).run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
}).config(['$sailsProvider', function($sailsProvider) {
        $sailsProvider.url = 'http://localhost:1337';
    }])

        .