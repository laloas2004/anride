

angular.module('app', ['ionic', 'ionic-sidemenu', 
    'app.controllers', 
    'app.directives', 
    'app.services', 
    'ngCordova', 
    'ngSails',
    'ngStorage',
    'angularMoment'])
        .run(function($ionicPlatform, $rootScope, $window, $cordovaSQLite) {
            
            var entorno = 2;
    
            switch(entorno) {
                    case 1:
                        // Desarrollo local san nicolas.
                        console.log('Apuntando entorno num 1');
                        $rootScope.serverIp = "http://192.168.15.98:1337";
                        console.log($rootScope.serverIp);
                        break;
                    case 2:
                        // Desarrollo local sabinas Hgo.
                        console.log('Apuntando entorno num 2');
                        $rootScope.serverIp = "http://192.168.1.69:1337";
                        console.log($rootScope.serverIp);
                        break;
                    case 3:
                        // Server Pruebas Publico.
                        $rootScope.serverIp = "http://104.131.116.22";
                        break;
                    case 4:
                        // Server Produccion Publico.
                        $rootScope.serverIp = "http://46.101.180.213";
                        break;
                    default:
                        console.log('Apuntando entorno default');
                        $rootScope.serverIp = "http://192.168.15.98:1337";
                        console.log($rootScope.serverIp);
            }
    
            $rootScope.google_key  = "AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8";
            
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
                                //templateUrl: 'templates/logout.html',
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
                        cache:false,
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
                        cache:false,
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
                    .state('app.registro', {
                        url: '/registro',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/registro.html',
                                controller: 'RegistroCtrl',
                                params: {
                                }
                            }
                        }
                    })
                     .state('app.selAuto', {
                        url: '/autos',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/seleccionar_auto.html',
                                controller: 'AutosCtrl',
                                params: {
                                    
                                }
                            }
                        }
                    })
                  

            $urlRouterProvider.otherwise('/app/login');
        })
        .config(['$sailsProvider', function($sailsProvider) {
                
            var entorno = 2;
    
            switch(entorno) {
                    case 1:
                        // Desarrollo local san nicolas.
                        $sailsProvider.url = "http://192.168.15.98:1337";
                        break;
                    case 2:
                        // Desarrollo local sabinas Hgo.
                        
                        $sailsProvider.url = "http://192.168.1.69:1337";
                        break;
                    case 3:
                        // Server Pruebas Publico.
                        $sailsProvider.url = "http://104.131.116.22";
                        break;
                    case 4:
                        // Server Produccion Publico.
                        $sailsProvider.url = "http://46.101.180.213";
                        break;
                    default:
                        $sailsProvider.url = "http://192.168.15.98:1337";
            }
                
                $sailsProvider.debug = true;                


            }])


      