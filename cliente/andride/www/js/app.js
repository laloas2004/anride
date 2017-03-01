

angular.module('app', ['ionic', 'ionic-sidemenu',
    'app.controllers',
    'app.directives',
    'app.services',
    'ngCordova',
    'ngSails',
    'ngStorage'
])
        .run(function($ionicPlatform, $rootScope, $window, $cordovaNetwork, $ionicPopup) {
//Validar que este conectado a internet.
            $rootScope.serverIp = "http://104.131.116.22:1337";

            $rootScope.google_key = "AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8";

            $window.addEventListener('offline', function() {
                
                $rootScope.$digest();
            });
            $window.addEventListener('online', function() {
//              


               
            });

            $ionicPlatform.ready(function() {

                var isOnline = $cordovaNetwork.isOnline();

                if (!isOnline) {

                    var alertPopup = $ionicPopup.alert({
                        title: 'Sin Acceso a Internet',
                        template: 'Ups, no pudimos comunicarnos con nuestro servidor, Revisa tu conexion a internet y vuelvelo a intentar...'
                    });

                    alertPopup.then(function(res) {
                        ionic.Platform.exitApp();
                    });


                }

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
                        },
                        cache: false
                    })
//                    .state('app.origen', {
//                        url: '/origen',
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/punto_origen.html',
//                                controller: 'OrigenCtrl'
//                            }
//                        }
//                    })
//                    .state('app.destino', {
//                        url: '/destino',
//                        views: {
//                            'menuContent': {
//                                templateUrl: 'templates/punto_destino.html',
//                                controller: 'DestinoCtrl',
//                            }
//                        }
//                    })
                    .state('app.confirmacion', {
                        url: '/confirmacion',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/confirmacion.html',
                                controller: 'ConfirmaCtrl'
                            }
                        }
                    })
                    .state('app.viajes', {
                        url: '/viajes',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/viajes.html',
                                controller: 'ViajesCtrl'
                            }
                        }
                    })
                    .state('app.pagos', {
                        url: '/pagos',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/pagos.html',
                                controller: 'PagosCtrl'
                            }
                        }
                    })
                    .state('app.notificaciones', {
                        url: '/notificaciones',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/notificaciones.html',
                                controller: 'NotificacionesCtrl'
                            }
                        }
                    })
                    .state('app.configuracion', {
                        url: '/configuracion',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/configuracion.html',
                                controller: 'ConfiguracionCtrl'
                            }
                        }
                    })
                    .state('app.login', {
                        url: '/login',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/login.html',
                                controller: 'LoginCtrl'
                            }
                        }
                    })
                    .state('app.logout', {
                        url: '/logout',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/logout.html',
                                controller: 'LogoutCtrl'
                            }
                        },
                        cache: false
                    })

            $urlRouterProvider.otherwise('/app/login');
        })
        .config(['$sailsProvider', function($sailsProvider) {

                $sailsProvider.url = "http://104.131.116.22:1337";
                $sailsProvider.debug = true; 
                //digital ocean.
//                $sailsProvider.url = 'http://104.131.116.22:1337';

            }])


      