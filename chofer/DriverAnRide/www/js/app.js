

angular.module('app', ['ionic', 'ionic-sidemenu', 
    'app.controllers', 
    'app.directives', 
    'app.services', 
    'ngCordova', 
    'ngSails',
    'ngStorage',
    'angularMoment'])
        .run(function($ionicPlatform, $rootScope, $window, $cordovaSQLite) {
//Validar que este conectado a internet.
            $rootScope.serverIp = "http://104.131.116.22:1337";
            
            $rootScope.google_key  = "AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8";
            
            console.log('connectado a internet:'+ $window.navigator.onLine);
            
            $window.addEventListener('offline', function() {
                console.log('offline');
                $rootScope.$digest();
            });
            $window.addEventListener('online', function() {
                console.log('online');
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
                    .state('app.main', {
                        url: '/main',
                        
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/home.html',
                                controller: 'MainCtrl',
                                params:{
                                    'regresoDestino':'false'
                                }
                            }
                        }
                    })
                    .state('app.cartera', {
                        url: '/cartera',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/cartera.html',
                                controller: 'CarteraCtrl',
                                params:{
                                    'regresoDestino':'false'
                                }
                            }
                        }
                    })
                      .state('app.historial', {
                        url: '/historial',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/historial_viajes.html',
                                controller: 'HistorialCtrl',
                                params:{
                                    'regresoDestino':'false'
                                }
                            }
                        }
                    })
                     .state('app.configuracion', {
                        url: '/configuracion',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/configuracion.html',
                                controller: 'ConfiguracionCtrl',
                                params:{
                                    'regresoDestino':'false'
                                }
                            }
                        }
                    })
                      .state('app.ayuda', {
                        url: '/ayuda',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/ayuda.html',
                                controller: 'AyudaCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                        .state('app.salir', {
                        url: '/salir',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/logout.html',
                                controller: 'LogOutCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                     .state('app.login', {
                        url: '/login',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/login.html',
                                controller: 'LoginCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                     .state('app.pickup', {
                        url: '/pickup',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/pickup.html',
                                controller: 'PickupCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                       .state('app.servicio', {
                        url: '/servicio',
                        views: {
                            cache:false,
                            'menuContent': {
                                templateUrl: 'templates/pickoff.html',
                                controller: 'ServicioCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                    
                      .state('app.cancelacion', {
                        url: '/cancelacion',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/cancelacion.html',
                                controller: 'CancelCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                      .state('app.solicitud', {
                        url: '/solicitud',
                        cache:false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/solicitud_servicio.html',
                                controller: 'SolicitudCtrl',
                                params:{
                                    
                                }
                            }
                        }
                    })
                  

            $urlRouterProvider.otherwise('/app/login');
        })
        .config(['$sailsProvider', function($sailsProvider) {
                
                $sailsProvider.url = "http://104.131.116.22:1337";
                $sailsProvider.debug = false;                
                //digital ocean.
//                $sailsProvider.url = 'http://104.131.116.22:1337';

            }])


      