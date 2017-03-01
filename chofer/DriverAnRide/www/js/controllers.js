angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, AuthService, $state) {

            $scope.platform = ionic.Platform.platform();
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});



            AuthService.isAuthenticated().then(function(response) {
                $state.go('app.main', {});

            }, function(err) {
                console.log('AuthService.isAuthenticated()');
                console.log(err);
                $state.go('app.login', {});

            });


        })
        .controller('MainCtrl', function($scope,
                $rootScope,
                $sails,
                $stateParams,
                $state,
                $ionicLoading,
                $http,
                $cordovaGeolocation,
                $ionicScrollDelegate,
                $ionicSideMenuDelegate,
                $ionicNavBarDelegate,
                $ionicPlatform,
                AuthService,
                choferService,
                $q,
                $ionicPopup,
                $ionicModal,
                $localStorage,
                $sessionStorage,
                $cordovaLocalNotification) {



            $ionicPlatform.ready(function() {
                

//            var mapDiv = document.getElementById("map_canvas");
//              
//            $scope.map = plugin.google.maps.Map.getMap(mapDiv);
//
//            $scope.map.setDebuggable(true);
            

            })



            $ionicModal.fromTemplateUrl('templates/modal_solicitud.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.modal_solicitud = modal;

            });


//            $sails.on('solicitud', function(data) {
//                
//                $cordovaLocalNotification.schedule({
//                    id: 1,
//                    title: 'An Ride',
//                    text: 'Nuevo Servicio',
//                    data: {
//                        customProperty: 'custom value'
//                    }
//                }).then(function(result) {
//                    console.log(result);
//                });
//
//                $rootScope.solicitud = data;
//
//                $rootScope.modal_solicitud.show();
//
//            });

            $sails.on('connect', function(data) {

                if ($localStorage.chofer.id) {

                    AuthService.suscribe().then(function(response) {
                        console.log(response);
                    });

                }

            });
            $sails.on('disconnect', function(data) {


                alert('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');
            });

            $sails.on('solicitud.enbusqueda', function(data) {
                
                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: 'Nuevo Servicio ',
                    text: 'Tenemos un nuevo servicio para ti',
                    data: {
                        customProperty: 'custom value'
                    }
                }).then(function(result) {
                    console.log(result);
                });
                
                $rootScope.solicitud = data;
                $rootScope.modal_solicitud.show();

            });


            $sails.on('solicitud.enbusqueda.vencio', function(data) {

                $rootScope.solicitud = {};
                $rootScope.modal_solicitud.hide();

            })

            $scope.$storage = $localStorage;

            $ionicNavBarDelegate.showBackButton(false);

            document.addEventListener("deviceready", function() {

                cordova.plugins.backgroundMode.setEnabled(true);

                cordova.plugins.backgroundMode.onactivate = function() {
                    
                    console.log('BG activated');
                    
                    $sails.on('solicitud', function(data) {
                        
                        $cordovaLocalNotification.schedule({
                            
                            id: 1,
                            title: 'An Ride',
                            text: 'Nuevo Servicio',
                            data: {
                                customProperty: 'custom value'
                            }
                        }).then(function(result) {
                            
                            console.log(result);
                        });
                        

//                        $rootScope.solicitud = data;
//
//                        $rootScope.modal_solicitud.show();

                    });
                    var watchOptions = {
                        timeout: 30000,
                        maximumAge: 3600000,
                        enableHighAccuracy: true // may cause errors if true
                    };

                    var watch = $cordovaGeolocation.watchPosition(watchOptions);

                    watch.then(
                            null,
                            function(err) {
                                // error
                            },
                            function(position) {
                                var lat = position.coords.latitude
                                var long = position.coords.longitude
                                $scope.$storage.position = {};
debugger;
                                if ($scope.$storage.position.lon != position.coords.longitude || $scope.$storage.position.lon != position.coords.latitude) {

                                    $scope.$storage.position.lon = position.coords.longitude;
                                    $scope.$storage.position.lat = position.coords.latitude;

                                    choferService.updatePosition(position).then(function(response) {

                                        console.log("Se actualizo posicion con watch" + response);
                                        consol.log(new Date());
                                    })



                                }


                            });

                    $rootScope.watch = watch;
                };

                cordova.plugins.backgroundMode.ondeactivate = function() {
                    console.log('BG deactivated');
                };

                cordova.plugins.backgroundMode.onfailure = function(errorCode) {
                    console.log('BG failure');
                };



            }, false);

            $scope.watchposition = function() {
                var watchOptions = {
                    timeout: 30000,
                    maximumAge: 5000,
                    enableHighAccuracy: true // may cause errors if true
                };

                var watch = $cordovaGeolocation.watchPosition(watchOptions);

                watch.then(
                        null,
                        function(err) {
                            // error
                        },
                        function(position) {
                            var lat = position.coords.latitude
                            var long = position.coords.longitude

                            if ($scope.$storage.position.lon != position.coords.longitude || $scope.$storage.position.lon != position.coords.latitude) {

                                $scope.$storage.position.lon = position.coords.longitude;
                                $scope.$storage.position.lat = position.coords.latitude;

                                choferService.updatePosition(position).then(function(response) {
                                        
                                    console.log("Se actualizo posicion" + response);
                                })



                            }


                        });
            };


            $scope.updatePosition = function() {

                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function(position) {
                            $scope.$storage.position.lon = position.coords.longitude;
                            $scope.$storage.position.lat = position.coords.latitude;
                            
//                            var myPosition = new plugin.google.maps.LatLng(position.coords.latitude,position.coords.longitude); 
                            
//                            $scope.map.addMarker({
//                                 'position': myPosition
//                            },function(marker){
//                                
//                            });
                            
//                            $scope.map.moveCamera({
//                                'target': myPosition,
//                                'zoom': 17,
//                                'tilt': 30
//                            },function(){
//                                
//                                
//                            });
                            
                            choferService.updatePosition(position).then(function(response) {

                                console.log("Se actualizo posicion" + response);
                            })

                        }, function(err) {
                            console.log(err);
                        });
            }

            $scope.updatePosition();

//            $scope.selectJob = function() {
//
//            }



        })
        .controller('SideMenuCtrl', function($scope, $ionicHistory, $rootScope) {

        

            $scope.theme = 'ionic-sidemenu-dark';
            $scope.tree1 = [];
            $scope.tree = [{
                    id: 1,
                    name: 'Inicio',
                    icon: "",
                    level: 0,
                    state: 'app.main'
                }, {
                    id: 2,
                    name: 'Cartera',
                    level: 0,
                    icon: '',
                    state: 'app.cartera'
                }, {
                    id: 3,
                    name: 'Historial de Viajes',
                    level: 0,
                    icon: '',
                    state: 'app.historial'
                }, {
                    id: 4,
                    name: 'Configuracion',
                    level: 0,
                    icon: '',
                    state: 'app.configuracion'
                },
                {
                    id: 4,
                    name: 'Ayuda',
                    level: 0,
                    icon: '',
                    state: 'app.ayuda'
                },
                {
                    id: 5,
                    name: 'Salir',
                    level: 0,
                    icon: '',
                    state: 'app.salir'
                }

            ];

            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };

        })

        .controller('CarteraCtrl', function($scope) {


        })
        .controller('HistorialCtrl', function($scope, $rootScope, $ionicSideMenuDelegate, clienteService, $state) {


        })
        .controller('ConfirmaCtrl', function($scope, $ionicHistory) {



        })
        .controller('HistorialCtrl', function($scope, $ionicHistory) {



        })
        .controller('ConfiguracionCtrl', function($scope, $ionicHistory) {



        })
        .controller('AyudaCtrl', function($scope, $ionicHistory) {



        })
        .controller('LogOutCtrl', function($scope, $rootScope, $ionicHistory, AuthService, $state) {

            AuthService.logout().then(function() {
//                $rootScope.watch.clearWatch();
                $state.go('app.login', {});
            });

        })
        .controller('LoginCtrl', function($scope, $ionicHistory, $ionicSideMenuDelegate, $ionicPlatform, AuthService, $localStorage, $state) {

            $scope.$storage = $localStorage;

            $ionicSideMenuDelegate.canDragContent(false);

            $ionicPlatform.registerBackButtonAction(function(event) {
                event.preventDefault();
                ionic.Platform.exitApp();
            }, 100);
            $scope.validate = function() {
                $scope.login();
            };
            $scope.login = function() {

                AuthService.login($scope.email, $scope.password).then(function(response) {

                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe().then(function(response) {


                        $state.go('app.main', {});
                    }, function(err) {
                        console.log('AuthService.suscribe()');
                        console.log(err);
                    });

                }, function(err) {
                    console.log('AuthService.login()');
                    console.log(err);
                })

            };
            $scope.onOlvidastePass = function() {

            };
            $scope.onRegistrate = function() {

            }

        })

        .controller('JobModalController', function($scope, $ionicHistory, $rootScope, $sails,$localStorage,$state) {

            $sails.on('solicitud.enbusqueda.cont', function(data) {
                console.log(data);
                var tiempo_espera = parseInt(data.tiempo_espera);
                var tiempo = parseInt(data.tiempo);

                $scope.remainingTime = (tiempo_espera - tiempo);

            })
            
            $scope.selectJob = function() {
                
                var data = {solicitud: $rootScope.solicitud, chofer: $localStorage.chofer};
debugger;
                $sails.post("/choferes/servicio", data)

                        .success(function(data, status, headers, jwr) {
                            
                            
                            $rootScope.cliente = data.cliente;
                            $localStorage.servicio = data.servicio;
                            $localStorage.socketId = data.socketId;

                            $rootScope.modal_solicitud.hide();

                            $state.go('app.pickup', {});

                        })
                        
                        .error(function(data, status, headers, jwr) {


                        });

                
            }


        })

        .controller('PickupCtrl', function($scope, $ionicHistory,$localStorage,$rootScope,$sails,$state) {
            debugger;
            $scope.pickup = {
             direccion_origen:$rootScope.solicitud.direccion_origen,
             direccion_destino:$rootScope.solicitud.direccion_destino,
             cliente:$rootScope.cliente,
             solicitud:$rootScope.solicitud
              
                
            };
            $scope.onPlace = function() {
                
                var data = {
                    servicio: $localStorage.servicio
                };

                $sails.post("/choferes/place", data)

                        .success(function(data, status, headers, jwr) {

                            console.log(data);

                        })
                        .error(function(data, status, headers, jwr) {


                        });
            }

            $scope.empiezaViaje = function() {
                
                $state.go('app.pickoff', {});
                
                   
                  }


        })
        
        .controller('PickoffCtrl', function($scope, $sails, $localStorage, $rootScope,$ionicPopup,$state) {


            $scope.servicio = $localStorage.servicio;
            $scope.solicitud = $rootScope.solicitud;
            $scope.inicio_viaje = {fechaHora: new Date(),posicion:$localStorage.position};
            
            
            var data = {servicio: $scope.servicio,inicio_viaje: $scope.inicio_viaje};
            

            $sails.post("/choferes/servicio/inicio", data)

                    .success(function(data, status, headers, jwr) {

                        console.log(data);

                    })
                    .error(function(data, status, headers, jwr) {


                    });
            
            
           $scope.showPayment = function(){
               
              $scope.fin_viaje = {fechaHora: new Date(),posicion:$localStorage.position};
              
              var data = {servicio: $scope.servicio,fin_viaje:$scope.fin_viaje};
              
                $sails.post("/choferes/servicio/final", data)

                        .success(function(data, status, headers, jwr) {
                            
                            $scope.totales = data;
                            
                            $ionicPopup.show({
                                templateUrl: 'templates/popup_cobrar.html',
                                title: 'Total a Pagar',
                                scope: $scope,
                                buttons: [
                                    {text: 'Cancelar'},
                                    {
                                        text: 'Confirmar',
                                        type: 'button-balanced',
                                        onTap: function(e) {
                                            $scope.confirmaPago();
                                        }
                                    }
                                ]
                            });

                        })
                        .error(function(data, status, headers, jwr) {


                        });

            }

            $scope.confirmaPago = function() {

                alert('pago confimado');
                $state.go('app.main', {});
            }

        })
        