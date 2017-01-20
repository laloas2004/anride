

angular.module('app', ['ionic', 'ionic-sidemenu', 'app.controllers', 'app.directives', 'app.services', 'ngCordova', 'ngSails'])
        .run(function($ionicPlatform) {

            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);

                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            })
        })
        .config(function($stateProvider, $urlRouterProvider) {

            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('app.map', {
                        url: '/map',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/map.html',
                                controller: 'MapCtrl'
                            }
                        }
                    })

            $urlRouterProvider.otherwise('/app/map');
        })
        .config(['$sailsProvider', function($sailsProvider) {
                $sailsProvider.url = 'http://104.131.116.22:1337';
            }])


      