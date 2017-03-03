angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, AuthService, $state) {

            $scope.platform = ionic.Platform.platform();

            AuthService.isAuthenticated().then(function(response) {

                AuthService.suscribe().then(function(response) {
                    $state.go('app.main', {});

                }, function(e) {
                    console.error(e);
                });


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
                $cordovaLocalNotification,
                $cordovaDialogs) {

            $scope.$storage = $localStorage;

            if ($localStorage.chofer.status == "activo") {
                $scope.estadoBtnClass = "button-assertive";
                $scope.estadoBtn = "Desactivarse";
            } else {
                $scope.estadoBtnClass = "button-balanced";
                $scope.estadoBtn = "Activarse";
            }

            $ionicPlatform.ready(function() {


                var mapDiv = document.getElementById("map_canvas");

                $scope.map = plugin.google.maps.Map.getMap(mapDiv);

                $scope.map.setDebuggable(true);


            })


            $sails.on('connect', function(data) {

                if ($localStorage.chofer.id) {
                    AuthService.suscribe().then(function(response) {
                        console.log('Suscribe Chofer:');
                        console.log(response);
                    }, function(e) {
                        console.error(e);
                    });

                }

            });
            $sails.on('disconnect', function(data) {

//                alert('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');
            });
            $sails.on('servicio', function(data) {

                if (data.data.servicio.cancelo == "cliente") {

                    $cordovaDialogs.alert('El Usuario Cancelo el Servicio', 'Servicio Cancelado', 'OK')
                            .then(function() {

                                var fin_viaje = {fechaHora: new Date(), posicion: $localStorage.position};

                                $sails.post("/choferes/servicio/cancelo/cliente", {servicioId: data.data.servicio.id, fin_viaje: fin_viaje})

                                        .success(function(data, status, headers, jwr) {

                                            $localStorage.solicitud = {};
                                            $localStorage.servicio = {};
                                            $state.go('app.main', {});

                                        })
                                        .error(function(data, status, headers, jwr) {

                                        });
                            });

                }


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

                $localStorage.solicitud = data;

                $state.go('app.solicitud', {});

            });



            $ionicNavBarDelegate.showBackButton(false);

            document.addEventListener("deviceready", function() {

                cordova.plugins.backgroundMode.setEnabled(true);

                cordova.plugins.backgroundMode.onactivate = function() {

                    console.log('BG activated');

                };

                cordova.plugins.backgroundMode.ondeactivate = function() {
                    console.log('BG deactivated');
                };

                cordova.plugins.backgroundMode.onfailure = function(errorCode) {
                    console.log('BG failure');
                };

            }, false);

            $scope.watchposition = function() {

                var actualizo = false;
                $scope.$storage.position = {};

                var watchOptions = {
                    timeout: 30000000,
                    maximumAge: 20000,
                    enableHighAccuracy: true // may cause errors if true
                };

                var watch = $cordovaGeolocation.watchPosition(watchOptions);

                watch.then(
                        null,
                        function(err) {
                            // error
                        },
                        function(position) {
                            console.log('Se ejecuto watchPosition:');
                            console.log('Lat: ' + position.coords.latitude + ' Lon:' + position.coords.longitude);
                            
                            
                            var lat = position.coords.latitude
                            var lon = position.coords.longitude

                            $scope.$storage.position.lon = position.coords.longitude;
                            $scope.$storage.position.lat = position.coords.latitude;

                         
                            var myPosition = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                            $scope.map.addMarker({
                                'position': myPosition
                            }, function(marker) {

                            });

                            $scope.map.moveCamera({
                                'target': myPosition,
                                'zoom': 17,
                                'tilt': 30
                            }, function() {


                            });

                                choferService.updatePosition(position).then(function(response) {

                                    console.log("Se actualizo posicion" + response);
                                    actualizo = true;

                                })

                       

                        });
            };


            $scope.watchposition();


            $scope.cambiarEstadoChofer = function() {
                var action = '';

                if ($localStorage.chofer.status == 'activo') {
                    action = "inactivo";
                } else if ($localStorage.chofer.status == 'inactivo') {
                    action = "activo";
                } else {
                    action = "activo";
                }


                $sails.post("/choferes/estatus", { action: action})
                        .success(function(data, status, headers, jwr) {

                            $localStorage.chofer.status = data.status;

                            if (data.status == "activo") {

                                $scope.estadoBtn = "Desactivarse";
                                $scope.estadoBtnClass = "button-assertive";
                            } else {
                                $scope.estadoBtn = "Activarse";
                                $scope.estadoBtnClass = "button-balanced";
                            }


                        })
                        .error(function(data, status, headers, jwr) {


                        })

            }


            $scope.$on('$ionicView.beforeEnter', function(event, data) {

                console.log('Before Enter');


            })
            $scope.$on('$ionicView.afterEnter', function(event, data) {

                console.log('After Enter');
//              Si el chofer tiene un servicio en proceso.

                if ($localStorage.servicio.id) {
                    //Obtengo el servicio para actualizar el status.
                    $sails.get("/choferes/servicio", {servicioId: $localStorage.servicio.id})
                            .success(function(servicio, status, headers, jwr) {

                                $localStorage.servicio = servicio;

                                if ($localStorage.servicio.status == 'iniciada') {
                                    $state.go('app.pickup', {});

                                } else if ($localStorage.servicio.status == 'enproceso') {
                                    $state.go('app.servicio', {});
                                } else if ($localStorage.servicio.status == 'cancelada') {
                                    if ($localStorage.chofer.status != 'activo') {

                                        $scope.cambiarEstadoChofer();
                                        $localStorage.servicio = {};
                                        $localStorage.solicitud = {};

                                    } else {
                                        $localStorage.servicio = {};
                                        $localStorage.solicitud = {};
                                    }

                                }


                            })
                            .error(function() {
                            });



                }


            })

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
        .controller('SolicitudCtrl', function($scope, $ionicHistory, $ionicSideMenuDelegate, $ionicPlatform, AuthService, $localStorage, $state, $sails, $rootScope) {
            $scope.$storage = $localStorage;
            $scope.servicioAceptado = false;
            $scope.solicitud = $localStorage.solicitud;

            $sails.on('solicitud.enbusqueda.cont', function(data) {

                var tiempo_espera = parseInt(data.tiempo_espera);
                var tiempo = parseInt(data.tiempo);

                $scope.remainingTime = (tiempo_espera - tiempo);

            })

            $sails.on('solicitud.enbusqueda.vencio', function(data) {

                if (!$scope.servicioAceptado) {

                    $localStorage.solicitud = {};
                    $state.go('app.main', {});
                }
            })

            $scope.selectJob = function() {

                $scope.servicioAceptado = true;

                var data = {solicitud: $localStorage.solicitud, chofer: $localStorage.chofer};

                $sails.post("/choferes/servicio", data)

                        .success(function(data, status, headers, jwr) {

                            $rootScope.cliente = data.cliente;
                            $localStorage.cliente = data.cliente;
                            $localStorage.servicio = data.servicio;
                            $localStorage.socketId = data.socketId;

                            $state.go('app.pickup', {});

                        })

                        .error(function(data, status, headers, jwr) {


                        });


            }



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
        .controller('PickupCtrl', function($scope, $ionicHistory, $localStorage, $rootScope, $sails, $state, $cordovaDialogs) {
            $scope.$storage = $localStorage;
            $scope.pickup = {
                direccion_origen: $localStorage.solicitud.direccion_origen,
                direccion_destino: $localStorage.solicitud.direccion_destino,
                cliente: $rootScope.cliente,
                solicitud: $localStorage.solicitud
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

                $state.go('app.servicio', {});


            }

            $scope.cancelarViaje = function() {

                $cordovaDialogs.confirm('Esta Seguro de Cancelar el Servicio', 'Cancelar Viaje', ['SI', 'NO'])

                        .then(function(buttonIndex) {

                            var btnIndex = buttonIndex;

                            if (btnIndex == 1) {


                                $sails.post("/choferes/servicio/cancel", {servicioId: $localStorage.servicio.id})
                                        .success(function(data, status, headers, jwr) {


                                            $localStorage.servicio = {};
                                            $localStorage.solicitud = {};
                                            $state.go('app.main', {});

                                        })
                                        .error(function(data, status, headers, jwr) {
                                        });

                            }


                        });


            }


        })
        .controller('ServicioCtrl', function($scope, $sails, $localStorage, $rootScope, $ionicPopup, $state) {

            $scope.$storage = $localStorage;
          
            $scope.servicio = $localStorage.servicio;
            $scope.solicitud = $localStorage.solicitud;
            $scope.cliente = $rootScope.cliente;
            $localStorage.solicitud = $rootScope.cliente;

            $scope.inicio_viaje = {fechaHora: new Date(), posicion: $localStorage.position};


            $sails.post("/choferes/servicio/inicio", {servicio: $scope.servicio, inicio_viaje: $scope.inicio_viaje})

                    .success(function(data, status, headers, jwr) {

                        console.log(data);

                        $localStorage.servicio = data.servicio;
                        $scope.inicioContador();

                    })
                    .error(function(data, status, headers, jwr) {


                    });


            $scope.terminarViaje = function() {

                clearInterval($scope.contadorServicio);

                $scope.fin_viaje = {fechaHora: new Date(), posicion: $localStorage.position};

                var data = {servicio: $scope.servicio, fin_viaje: $scope.fin_viaje};

                $sails.post("/choferes/servicio/final", data)

                        .success(function(data, status, headers, jwr) {

                            $scope.totales = data;

                            $ionicPopup.show({
                                templateUrl: 'templates/popup_cobrar.html',
                                title: 'Total a Pagar',
                                scope: $scope,
                                buttons: [
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
                $localStorage.servicio = {};
                $state.go('app.main', {});
            }
            $scope.inicioContador = function() {

                console.log('Inicio contador de Servicio');
                $scope.tiempo = {};
                $scope.tiempo.horas = 0;
                $scope.tiempo.min = 0;
                $scope.tiempo.segundos = 0;
                $scope.contadorServicio = setInterval(function() {

                    $scope.tiempo.segundos++;

                    if ($scope.tiempo.segundos >= 60) {
                        $scope.tiempo.min++;
                        $scope.tiempo.segundos = 0;
                    }

                    if ($scope.tiempo.min >= 60) {
                        $scope.tiempo.horas++;
                        $scope.tiempo.min = 0;
                    }

                }, 1000);

            }

        })
        