angular.module('app', ['ionic', 'app.controllers', 'app.directives', 'app.services', 
'ngSails', 'ngCordova', ])

        .run(function($ionicPlatform) {
            
            
            $ionicPlatform.ready(function() {
                
                
                
                
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
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
                                controller: 'MapCtrl',
                                params: {
                                    'regresoDestino': 'false'
                                }
                            }
                        }
                    })
                    .state('app.origen', {
                        url: '/origen',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/punto_origen.html',
                                controller: 'OrigenCtrl'
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
                    .state('app.confirmacion', {
                        url: '/confirmacion',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/confirmacion.html',
                                controller: 'ConfirmaCtrl'
                            }
                        }
                    })

            $urlRouterProvider.otherwise('/app/map');
        })
        .config(['$sailsProvider', function($sailsProvider) {
                $sailsProvider.url = "http://104.131.116.22:1337";

                //digital ocean.
//                $sailsProvider.url = 'http://104.131.116.22:1337';

            }])

