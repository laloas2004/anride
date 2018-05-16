

angular.module('app', ['ionic', 'ionic-sidemenu', 'ionic.native',
    'app.controllers',
    'app.directives',
    'app.services',
    'ngCordova',
    'ngSails',
    'ngStorage',
    'angularMoment'

])
    .run(function ($ionicPlatform, $rootScope, $window, $cordovaNetwork, $ionicPopup) {

        var entorno = 2;

        switch (entorno) {
            case 1:
                // Desarrollo local san nicolas.
                console.log('Apuntando entorno num 1');
                $rootScope.serverIp = "http://192.168.15.98:1337";
                console.log($rootScope.serverIp);
                break;
            case 2:
                // Desarrollo local sabinas Hgo.
                console.log('Apuntando entorno num 2');
                $rootScope.serverIp = "http://192.168.1.74:1337";
                console.log($rootScope.serverIp);
                break;
            case 3:
                // Server Pruebas Publico.
                $rootScope.serverIp = "http://104.131.116.22";
                break;
            case 4:
                // Server Produccion Publico.
                $rootScope.serverIp = "http://35.227.102.88";
                break;
            default:
                console.log('Apuntando entorno default');
                $rootScope.serverIp = "http://192.168.15.98:1337";
                console.log($rootScope.serverIp);

        }

        $rootScope.isGpsEnabled = false;

        $rootScope.google_key = "AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8";

        $window.addEventListener('offline', function () {

            console.log('se ejecuti el evento offline');

            $rootScope.$digest();
        });
        $window.addEventListener('online', function () {
            //

            console.log('se ejecuti el evento online');

        });

        $ionicPlatform.ready(function () {



            screen.lockOrientation('portrait');

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            function checkAvailability() {

                cordova.plugins.diagnostic.isGpsLocationEnabled(function (available) {
                    console.log("GPS location is " + (available ? "available" : "not available"));
                    if (!available) {

                        var alertPopup = $ionicPopup.alert({
                            title: 'No tenemos acceso al GPS',
                            template: 'Es necesario usar el GPS, Por favor activa tu GPS y vuelve a entrar.'
                        });

                        alertPopup.then(function (res) {

                            // ionic.Platform.exitApp();

                        });

                        checkAuthorization();
                    } else {
                        $rootScope.isGpsEnabled = true;
                        console.log("GPS location is ready to use");
                    }
                }, function (error) {
                    console.error("The following error occurred: " + error);
                });
            }

            function checkAuthorization() {
                cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {
                    console.log("Location is " + (authorized ? "authorized" : "unauthorized"));
                    if (authorized) {
                        checkDeviceSetting();
                    } else {
                        cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                            switch (status) {
                                case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                                    console.log("Permission granted");
                                    checkDeviceSetting();
                                    break;
                                case cordova.plugins.diagnostic.permissionStatus.DENIED:
                                    console.log("Permission denied");
                                    // User denied permission
                                    break;
                                case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                                    console.log("Permission permanently denied");
                                    // User denied permission permanently
                                    break;
                            }
                        }, function (error) {
                            console.error(error);
                        });
                    }
                }, function (error) {
                    console.error("The following error occurred: " + error);
                });
            }

            function checkDeviceSetting() {
                cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {
                    console.log("GPS location setting is " + (enabled ? "enabled" : "disabled"));
                    if (!enabled) {
                        cordova.plugins.locationAccuracy.request(function (success) {
                            console.log("Successfully requested high accuracy location mode: " + success.message);
                        }, function onRequestFailure(error) {
                            console.error("Accuracy request failed: error code=" + error.code + "; error message=" + error.message);
                            if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                                if (confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")) {
                                    cordova.plugins.diagnostic.switchToLocationSettings();
                                }
                            }
                        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
                    }
                }, function (error) {
                    console.error("The following error occurred: " + error);
                });
            }


            checkAvailability();

        });


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
        /*  .state('app.registro', {
              url: '/registro',
              views: {
                  'menuContent': {
                      templateUrl: 'templates/registro.html',
                      controller: 'RegistroCtrl'
                  }
              }
          })*/

        $urlRouterProvider.otherwise('/app/login');
    })
    .config(['$sailsProvider', function ($sailsProvider) {

        var entorno = 2;

        switch (entorno) {
            case 1:
                // Desarrollo local san nicolas.
                $sailsProvider.url = "http://192.168.15.98:1337";
                break;
            case 2:
                // Desarrollo local sabinas Hgo.
                $sailsProvider.url = "http://192.168.1.74:1337";
                break;
            case 3:
                // Server Pruebas Publico.
                $sailsProvider.url = "http://104.131.116.22";
                break;
            case 4:
                // Server Produccion Publico.
                $sailsProvider.url = "http://35.227.102.88";
                break;
            default:
                $sailsProvider.url = "http://192.168.15.98:1337";
        }

        $sailsProvider.debug = false;


    }]);
