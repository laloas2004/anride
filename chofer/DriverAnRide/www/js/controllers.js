angular.module('app.controllers', ['ngSails', 'ngCordova', 'angularMoment'])
        .controller('AppCtrl', function($scope,
                $rootScope,
                $ionicModal,
                $timeout,
                AuthService,
                $state) {

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
                solicitudService,
                $q,
                $ionicPopup,
                $ionicModal,
                $localStorage,
                $sessionStorage,
                $cordovaLocalNotification,
                $cordovaDialogs) {

            $scope.$storage = $localStorage;
            $rootScope.servicioRecuperado = false;

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


                        $ionicLoading.hide();
//                        console.log('Suscribe Chofer:');
//                        console.log(response);
                    }, function(e) {
                        console.error(e);
                    });

                }

            });
            $sails.on('disconnect', function(data) {

                $scope.disconnect = $ionicLoading.show({
                    template: 'UPS!, Hay problemas para comunicarnos con la red, revisa la conexion...',
                    showBackdrop: false
                });

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

                $localStorage.solicitud = data.solicitud;
                $localStorage.tiempo_espera = data.tiempo_espera;
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


                var watchOptions = {
                    timeout: 30000000,
                    maximumAge: 30000,
                    enableHighAccuracy: true // may cause errors if true
                };

                var watch = $cordovaGeolocation.watchPosition(watchOptions);
                var markerChofer = {};
                $scope.$storage.position = {};
                $scope.coords = {};
                watch.then(
                        null,
                        function(err) {
                            console.log(err);
                        },
                        function(position) {

                            $scope.coords = position.coords;

//                            console.log('Se ejecuto watchPosition:');
//                            console.log('Lat: ' + position.coords.latitude + ' Lon:' + position.coords.longitude);

                            try {
                                if ($scope.$storage.position) {
                                    $scope.$storage.position.lon = position.coords.longitude;
                                    $scope.$storage.position.lat = position.coords.latitude;
                                } else {
                                    $scope.$storage.position = {};
                                    $scope.$storage.position.lon = position.coords.longitude;
                                    $scope.$storage.position.lat = position.coords.latitude;
                                }

                            } catch (e) {
                                console.log(e);
                            }

                            var myPosition = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);


                            if (angular.isFunction(markerChofer.remove)) {

                                markerChofer.remove();
                            }

                            $scope.map.addMarker({
                                'position': myPosition
                            }, function(marker) {

                                markerChofer = marker;

                            });

                            $scope.map.moveCamera({
                                'target': myPosition,
                                'zoom': 17,
                                'tilt': 30
                            }, function() {


                            });

                        });
            };


            $scope.watchposition();
            $scope.$watch('coords.longitude', function(newVal, oldVal) {

                if (newVal === oldVal) {
                    return;
                }
                $scope.updatePositionServer();

            });
            $scope.$watch('coords.latitude', function(newVal, oldVal) {

                if (newVal === oldVal) {
                    return;
                }
                $scope.updatePositionServer();

            });
            $scope.updatePositionServer = function() {

                var position = $scope.coords;

                choferService.updatePosition(position).then(function(response) {

                    console.log("Se actualizo posicion" + response);
                    actualizo = true;

                });
            },
                    $scope.cambiarEstadoChofer = function() {
                        $ionicLoading.show({
                            template: 'Cambiando...',
                            showBackdrop: false
                        });
                        var action = '';

                        if ($localStorage.chofer.status == 'activo') {
                            action = "inactivo";
                        } else if ($localStorage.chofer.status == 'inactivo') {
                            action = "activo";
                        } else {
                            action = "activo";
                        }


                        $sails.post("/choferes/estatus", {action: action})
                                .success(function(data, status, headers, jwr) {

                                    $localStorage.chofer.status = data.status;

                                    if (data.status == "activo") {

                                        $scope.estadoBtn = "Desactivarse";
                                        $scope.estadoBtnClass = "button-assertive";
                                    } else {
                                        $scope.estadoBtn = "Activarse";
                                        $scope.estadoBtnClass = "button-balanced";
                                    }

                                    $ionicLoading.hide();
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



                solicitudService.getSolicitudPendiente().then(function(response) {

                    if (response.length > 0) {

                        $localStorage.servicio = response[0];
                        $rootScope.servicioRecuperado = true;

                        $sails.get("/choferes/solicitud", {SolId: response[0].solicitud})
                                .success(function(response, status, headers, jwr) {

                                    $localStorage.solicitud = response;

                                    if ($localStorage.servicio.status == 'iniciada') {
                                        $state.go('app.pickup', {});

                                    } else if ($localStorage.servicio.status == 'enproceso') {
                                        $state.go('app.servicio', {});
                                    }
                                })
                                .error(function(err) {
                                    console.log(err);
                                });



                    }


                }, function(err) {
                    console.log(err);

                });



            })

        })
        .controller('SideMenuCtrl', function($scope,
                $ionicHistory,
                $rootScope) {
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
        .controller('HistorialCtrl', function($scope,
                $rootScope,
                $ionicSideMenuDelegate,
                clienteService,
                $state) {


        })
        .controller('ConfirmaCtrl', function($scope,
                $ionicHistory) {



        })
        .controller('HistorialCtrl', function($scope,
                $ionicHistory) {



        })
        .controller('ConfiguracionCtrl', function($scope,
                $ionicHistory) {



        })
        .controller('AyudaCtrl', function($scope,
                $ionicHistory) {



        })
        .controller('SolicitudCtrl', function($scope,
                $ionicHistory,
                $ionicSideMenuDelegate,
                $ionicPlatform,
                AuthService,
                $localStorage,
                $state,
                $sails,
                $rootScope,
                $ionicLoading,
                $cordovaDialogs,
                $interval,
                $timeout,
                $cordovaLocalNotification) {

            $scope.$storage = $localStorage;
            $scope.servicioAceptado = false;
            $scope.solicitud = $localStorage.solicitud;
            tiempo = 0;
            $scope.timerSolicitud = $interval(function() {
                tiempo++;
                var tiempo_espera = parseInt($localStorage.tiempo_espera);

                $scope.remainingTime = (tiempo_espera - tiempo);

                if ($scope.remainingTime == 0) {
                    $ionicLoading.hide();
                    delete $localStorage.solicitud;
                    $state.go('app.main', {});

                    $interval.cancel($scope.timerSolicitud);
                }

            }, 1000);


            $sails.on('solicitud.enbusqueda.aceptada', function(data) {

                $interval.cancel($scope.timerSolicitud);
            })

            $scope.selectJob = function() {

                $timeout.cancel($scope.timeoutSolicitud);

                $ionicLoading.show({
                    template: 'Aceptando...',
                    showBackdrop: false
                });

                $scope.servicioAceptado = true;


                $scope.timeoutServicio = $timeout(function() {

                    $cordovaDialogs.alert('Ocurrio un error de comunicacion, revisa tu conexion a internet e intentalo mas tarde.', 'Sin Comunicacion con nuestro Servidor', 'OK')
                            .then(function() {
                                ionic.Platform.exitApp();
                            });


                }, 120000);
                
                if(!$localStorage.chofer){
                    
                  console.error('Error: Falta parametro Chofer.');  
                }
                
                if(!$localStorage.solicitud){
                   
                    console.error('Error: Falta parametro Solicitud.'); 
                }
                
                
                
                $sails.post("/choferes/servicio", {solicitud: $localStorage.solicitud, chofer: $localStorage.chofer})

                        .success(function(data, status, headers, jwr) {

                            $timeout.cancel($scope.timeoutServicio);

                            if (data.err == 'msg_no_entregado') {

                                $cordovaDialogs.confirm('El cliente no pudo ser notificado de confirmacion del servicio.', 'Cliente no Notificado', ['Continuar', 'Cancelar Servicio'])
                                        .then(function(buttonIndex) {
                                            // no button = 0, 'OK' = 1, 'Cancel' = 2
                                            var btnIndex = buttonIndex;

                                            if (btnIndex == 1) {

                                                $rootScope.cliente = data.cliente;
                                                $localStorage.cliente = data.cliente;
                                                $localStorage.servicio = data.servicio;
                                                $localStorage.socketId = data.socketId;

                                                $state.go('app.pickup', {});

                                                $ionicLoading.hide();

                                            } else if (btnIndex == 2) {

                                                $rootScope.cliente = data.cliente;
                                                $localStorage.cliente = data.cliente;
                                                $localStorage.servicio = data.servicio;
                                                $localStorage.socketId = data.socketId;
                                                $ionicLoading.hide();
                                                $sails.post("/choferes/servicio/cancel", {servicioId: $localStorage.servicio.id})
                                                        .success(function(data, status, headers, jwr) {


                                                            $localStorage.servicio = {};
                                                            $localStorage.solicitud = {};
                                                            $state.go('app.main', {});

                                                        })
                                                        .error(function(data, status, headers, jwr) {

                                                            console.error(data);
                                                            $cordovaDialogs.alert('Error', 'Lo sentimos ocurrio un error de comunicacion, intentalo mas tarde.', 'OK')
                                                                    .then(function() {
                                                                        ionic.Platform.exitApp();
                                                                    });

                                                        });

                                            }


                                        });

                            } else {

                                $rootScope.cliente = data.cliente;
                                $localStorage.cliente = data.cliente;
                                $localStorage.servicio = data.servicio;
                                $localStorage.socketId = data.socketId;

                                $state.go('app.pickup', {});

                                $ionicLoading.hide();

                            }


                        })

                        .error(function(data, status, headers, jwr) {
                            console.error(data);
                            $cordovaDialogs.alert('Error', 'Lo sentimos ocurrio un error de comunicacion, intentalo mas tarde.', 'OK')
                                    .then(function() {
                                        ionic.Platform.exitApp();
                                    });

                        });


            }

            $scope.timeoutSolicitud = $timeout(function() {

                if (!$scope.servicioAceptado) {

                    delete $localStorage.solicitud;
                    $state.go('app.main', {});
                }

            }, 30000);

            $scope.$on('$destroy', function() {
                $timeout.cancel($scope.timeoutSolicitud);
                $timeout.cancel($scope.timeoutServicio);
            });
        })
        .controller('LogOutCtrl', function($scope,
                $rootScope,
                $ionicHistory,
                AuthService,
                $state) {

            AuthService.logout().then(function() {
//                $rootScope.watch.clearWatch();
                $state.go('app.login', {});
            });

        })
        .controller('LoginCtrl', function($scope,
                $ionicHistory,
                $ionicSideMenuDelegate,
                $ionicPlatform,
                AuthService,
                $localStorage,
                $state,
                $cordovaDialogs) {

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



                    $cordovaDialogs.alert(err.data.err, err.data.err, 'OK')
                            .then(function() {

                            })

                })

            };
            $scope.onOlvidastePass = function() {

            };
            $scope.onRegistrate = function() {

            }

        })
        .controller('PickupCtrl', function($scope,
                $ionicHistory,
                $localStorage,
                $rootScope,
                $sails,
                $state,
                $cordovaDialogs,
                $ionicLoading,
                $cordovaGeolocation,
                servicioService,
                $timeout) {

            $scope.$storage = $localStorage;
            $scope.$storage.colaMsg = [];

            $scope.pickup = {
                direccion_origen: $localStorage.solicitud.direccion_origen,
                direccion_destino: $localStorage.solicitud.direccion_destino,
                cliente: $localStorage.cliente,
                solicitud: $localStorage.solicitud
            };

            $scope.onPlace = function() {
                $ionicLoading.show({
                    template: 'Enviando...',
                    showBackdrop: false
                });
                var data = {
                    servicio: $localStorage.servicio
                };

                $sails.post("/choferes/place", data)

                        .success(function(data, status, headers, jwr) {

                            console.log(data);
                            $ionicLoading.hide();

                        })
                        .error(function(data, status, headers, jwr) {


                        });
            }

            $scope.empiezaViaje = function() {

                $ionicLoading.show({
                    template: 'Iniciando Servicio...',
                    showBackdrop: false
                });

                $scope.$storage = $localStorage;
                $scope.servicio = $localStorage.servicio;
                $scope.solicitud = $localStorage.solicitud;
                $scope.cliente = $localStorage.cliente;


                $cordovaGeolocation

                        .getCurrentPosition({timeout: 100000, enableHighAccuracy: true})

                        .then(function(position) {

                            $scope.timeoutInicioViaje = $timeout(function() {

                                $cordovaDialogs.confirm('La conexion no responde', 'La conexion no responde, desea volver a intentar o salir.', ['ENVIAR', 'SALIR'])

                                        .then(function(buttonIndex) {

                                            var btnIndex = buttonIndex;

                                            if (btnIndex == 1) {

                                                $ionicLoading.hide();
                                                $scope.empiezaViaje();
                                            } else if (btnIndex == 2) {

                                                //Aqui las instrucciones para salir de la App.  

                                            }


                                        })

                            }, 90000);

                            $scope.inicio_viaje = {fechaHora: new Date(), posicion: {lat: position.coords.latitude, lon: position.coords.longitude}};

                            console.log('Inicio de Viaje:');
                            console.log($scope.inicio_viaje);

                            servicioService.iniciaViaje($localStorage.servicio, $scope.inicio_viaje).then(function(data) {

                                $timeout.cancel($scope.timeoutInicioViaje);

                                if (data.err == 'msg_no_entregado') {

                                    $cordovaDialogs.alert('El cliente no esta conactado', 'Se inicia el servicio sin notificar al Cliente', 'OK')
                                            .then(function() {

                                                $localStorage.servicio = data.servicio[0];
                                                $ionicLoading.hide();
                                                $state.go('app.servicio', {});

                                            })

                                } else {

                                    $localStorage.servicio = data.servicio[0];
                                    $ionicLoading.hide();
                                    $state.go('app.servicio', {});

                                }


                            }, function(err) {
                                console.error(err);
                                $cordovaDialogs.alert('Ocurrio un error', 'Ocurrio un error con su configuracion, intentalo mas tarde', 'OK')
                                        .then(function() {
                                            ionic.Platform.exitApp();
                                        })

                            })

                        }, function(err) {
                            console.log(err);
                            $ionicLoading.hide();
                            alert('Error:' + err);
                            $scope.empiezaViaje();
                        });


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
        .controller('ServicioCtrl', function($scope,
                $sails,
                $localStorage,
                $rootScope,
                $ionicPopup,
                $state,
                $ionicLoading,
                $cordovaGeolocation,
                amMoment,
                $interval) {

            $scope.$storage = $localStorage;
            $scope.tiempo = {};
            $scope.tiempo.horas = 0;
            $scope.tiempo.min = 0;
            $scope.tiempo.segundos = 0;
            $scope.distancia = 0;

            $scope.servicio = $localStorage.servicio;
            $scope.solicitud = $localStorage.solicitud;
            $scope.cliente = $localStorage.cliente;

            $scope.terminarViaje = function() {

                $ionicLoading.show({
                    template: 'Terminando Servicio...',
                    showBackdrop: false
                });

                clearInterval($scope.contadorServicio);

                $scope.fin_viaje = {fechaHora: new Date(), posicion: $localStorage.position};

                var data = {servicio: $localStorage.servicio, fin_viaje: $scope.fin_viaje};
                $sails.post("/choferes/servicio/final", data)

                        .success(function(data, status, headers, jwr) {

                            $scope.totales = data;
                            $ionicLoading.hide();
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

                            console.log(data);

                        });

            }
            $scope.confirmaPago = function() {

//                alert('pago confimado');
                $localStorage.servicio = {};
                $state.go('app.main', {});
            }
            $scope.iniciaTrackViaje = function() {

                $scope.$watch('$storage.position', function(newVal, oldVal) {




                    console.log('changed');
                }, true);

            }
            $scope.inicioContador = function() {

                $scope.intervalViaje = $interval(function() {

                    var fecha_inicio = moment($scope.servicio.inicio_fecha);
                    var ahora = moment();

                    var diff_segundos = (ahora.diff(fecha_inicio) / 1000);
                    var diff_min = parseInt(diff_segundos / 60);

                    $scope.tiempo.segundos = parseInt(diff_segundos % 60);
                    $scope.tiempo.min = parseInt(diff_min % 60);


                    $scope.tiempo.horas = parseInt(diff_min / 60);


                }, 1000);

            }
            $scope.inicioContador();
            $scope.iniciaTrackViaje();


        })
        .controller('RegistroCtrl', function($scope,
                $ionicHistory) {

                    

        })