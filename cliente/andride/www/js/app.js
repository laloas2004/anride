

angular.module('app', ['ionic', 'ionic-sidemenu','ionic.native',
    'app.controllers',
    'app.directives',
    'app.services',
    'ngCordova',
    'ngSails',
    'ngStorage',
    'angularMoment'

])
        .run(function ($ionicPlatform, $rootScope, $window, $cordovaNetwork, $ionicPopup) {
        
            var entorno = 1;
    
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
            
            $rootScope.google_key = "AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8";

            $window.addEventListener('offline', function () {

                $rootScope.$digest();
            });
            $window.addEventListener('online', function () {
//              



            });

            $ionicPlatform.ready(function () {

             //  var isOnline = $cordovaNetwork.isOnline();

              /*  if (!isOnline) {

                    var alertPopup = $ionicPopup.alert({
                        title: 'Sin Acceso a Internet',
                        template: 'Ups, no pudimos comunicarnos con nuestro servidor, Revisa tu conexion a internet y vuelvelo a intentar...'
                    });

                    alertPopup.then(function(res) {
                       // ionic.Platform.exitApp();
                    });


                }*/

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
        .config(function ($stateProvider, $urlRouterProvider) {

            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                    })
                    .state('app.map', {
                        url: '/map',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/map.html',
                                controller: 'MapCtrl'
                            }
                        }

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
                        cache: false,
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
                    .state('app.buscando_chofer', {
                        url: '/chofer',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/buscando_chofer.html',
                                controller: 'BuscandoCtrl'
                            }
                        }
                    })
                    .state('app.servicio_aprovado', {
                        url: '/servicio-aprovado',
                        cache: false,
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/driver.html',
                                controller: 'DriverCtrl'
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
                    .state('app.registro', {
                        url: '/registro',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/registro.html',
                                controller: 'RegistroCtrl'
                            }
                        }
                    })

            $urlRouterProvider.otherwise('/app/login');
        })
        .config(['$sailsProvider', function ($sailsProvider) {
                
            var entorno = 1;
    
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
           

            }]);


      