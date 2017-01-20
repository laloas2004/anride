

angular.module('app', ['ionic', 'ionic-sidemenu', 'app.controllers', 'app.directives', 'app.services', 'ngCordova', 'ngSails'])
        .run(function($ionicPlatform, $rootScope, $window) {
//Validar que este conectado a internet.
            alert($window.navigator.onLine);
            $window.addEventListener('offline', function() {
                alert('offline');
                $rootScope.$digest();
            });
            $window.addEventListener('online', function() {
                alert('online');
                $rootScope.$digest();
            });

            $ionicPlatform.ready(function() {


                screen.lockOrientation('portrait');

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
                    .state('app.destino', {
                        url: '/destino',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/punto_destino.html',
                                controller: 'DestinoCtrl'
                            }
                        }
                    })

            $urlRouterProvider.otherwise('/app/map');
        })
        .config(['$sailsProvider', function($sailsProvider) {
                $sailsProvider.url = 'http://192.168.15.98:1337';
            }])


      