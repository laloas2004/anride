angular.module('app.controllers', ['ngSails', 'ngCordova', 'angularMoment'])
        .controller('AppCtrl', function($scope,
                $cordovaNetwork,
                $cordovaDialogs,
                $rootScope,
                $ionicModal,
                $timeout,
                $sessionStorage,
                AuthService,
                $ionicPlatform,
                $state) {
                    
                    
                 $ionicPlatform.ready(function () {
                     

                                    $scope.platform = ionic.Platform.platform();

                                    // listen for Online event
                                    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                                      var onlineState = networkState;
                                      console.log('Se conecto a internet.');
                                    })

                                    // listen for Offline event
                                    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                                      $cordovaDialogs.alert('Upss, no nos podemos comunicar con la red, compruebe que tenga conexion a internet.','Sin Conexion', 'Aceptar');
                                      var offlineState = networkState;
                                    });



                          AuthService.isAuthenticated().then(function(response) {

                                        $sessionStorage.chofer = response.data.chofer;

                              AuthService.suscribe(response.data.chofer).then(function(response) {

                                  if( $rootScope.isGpsEnabled){

                                    $state.go('app.main', {});  

                                  }


                              }, function(err) {

                                  console.error(err);
                              });


                          }, function(err) {

                              console.log('AuthService.isAuthenticated()');

                              console.log(err);

                              $state.go('app.login', {});

                          });

 
                     
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
                $cordovaDialogs,
                $ionicGesture) {

            if (!$localStorage.autoActivo) {

                $state.go('app.selAuto', {});

            }
            
            $scope.autoActivo = $localStorage.autoActivo;
            
            $scope.$storage = $localStorage;
            $rootScope.servicioRecuperado = false;
            
            debugger;

            if ($sessionStorage.chofer.status == "activo") {
                $scope.estadoBtnClass = "button-assertive";
                $scope.estadoBtn = "Desactivarse";
            } else {
                $scope.estadoBtnClass = "button-balanced";
                $scope.estadoBtn = "Activarse";
            }

            $ionicPlatform.ready(function() {
                
             
                var mapDiv = document.getElementById("map_canvas");

                $scope.map = plugin.google.maps.Map.getMap(mapDiv);

                $scope.map.setDebuggable(false);


            });
            
            $scope.subscribeServerEvents = function(){
                
                    $sails.removeAllListeners();
                    
                    $sails.on('connect', function(data) {


                    AuthService.isAuthenticated().then(function(response) {

                        if($sessionStorage.chofer){

                        AuthService.suscribe().then(function(response) {

                                $ionicLoading.hide();

                                $sessionStorage.chofer.status = response.chofer.status;


                        }, function(err) {

                             console.error(err);
                             $ionicLoading.hide();


                        });
                    }else{

                        $ionicLoading.hide();
                        $state.go('app.login', {});

                    }


                    }, function(err) {
                         console.error(err);
                         $ionicLoading.hide();
                         $cordovaDialogs.alert('La session a expirado, favor de volver a logearse','Sesion Expirada' , 'OK')
                                    .then(function() {

                                        $state.go('app.login', {});
                                    });

                    });





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

                                        $sails.post("/choferes/servicio/cancelo/cliente", { servicioId: data.data.servicio.id, fin_viaje: fin_viaje})

                                                .success(function(data, status, headers, jwr) {

                                                    $localStorage.solicitud = {};
                                                    $localStorage.servicio = {};
                                                    $state.go('app.main', {});

                                                })
                                                .error(function(data, status, headers, jwr) {

                                                    console.log(jwr);

                                                });
                                    });

                        }

                    });

                    $sails.on('solicitud.enbusqueda', function(data) {

                        $cordovaLocalNotification.schedule({
                            id: 1,
                            title: 'Nuevo Servicio ',
                            text: 'Tenemos un nuevo servicio para ti',
                            sound: "file://sounds/taxi.mp3",
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
                
                
            };

            $scope.subscribeServerEvents();

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
                        var markerChofer = {};

                        $scope.$storage.position = {};

                        $scope.coords = {};

                        function succesWatchPosition(position) {

                                        console.log('Latitude: '          + position.coords.latitude          + '\n' +
                                                   'Longitude: '         + position.coords.longitude         + '\n' +
                                                   'Altitude: '          + position.coords.altitude          + '\n' +
                                                   'Accuracy: '          + position.coords.accuracy          + '\n' +
                                                   'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                                                   'Heading: '           + position.coords.heading           + '\n' +
                                                   'Speed: '             + position.coords.speed             + '\n' +
                                                   'Timestamp: '         + position.timestamp                + '\n');

                                        $scope.coords = position.coords;

                                        $scope.position = position;

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
                                            'position': myPosition,
                                            'icon': {url: '.img/car-icon.png',
                                            'size': {
                                                    width: 32,
                                                    height: 32
                                                }}
                                        }, function (marker) {

                                            markerChofer = marker;

                                            marker.setIcon({
                                                'url': 'img/car-icon.png',
                                                'size': {
                                                    width: 32,
                                                    height: 32
                                                }
                                            });

                                        });



                                        $scope.map.moveCamera({
                                            'target': myPosition,
                                            'zoom': 17,
                                            'tilt': 30
                                        }, function() {


                                        });

                                    }

                        function errorWatchPosition(err) {
                                            alert('code: '    + error.code    + '\n' +
                                                  'message: ' + error.message + '\n');
                                        console.error(err);
                                    }


                        var watch = cordova.plugins.locationServices.geolocation.watchPosition(succesWatchPosition, errorWatchPosition,{
                                    maximumAge: 5000,
                                    timeout: 30000,
                                    enableHighAccuracy: true,
                                    priority: 100,
                                    interval: 10000,
                                    fastInterval: 2000
                                });


            };
            
            document.addEventListener("deviceready", function() {
                
                $scope.watchposition();
                
             });
            
            $scope.$watch('coords.longitude', function(newVal, oldVal) {

                if (newVal === oldVal) {
                    return false;
                }
                $scope.updatePositionServer();

            });
            $scope.$watch('coords.latitude', function(newVal, oldVal) {

                if (newVal === oldVal) {
                    return false;
                }
                $scope.updatePositionServer();

            });
            $scope.updatePositionServer = function() {

                var position = $scope.coords;
                if($scope.position.coords.speed > 0){
                    
                choferService.updatePosition(position).then(function(response) {

                    console.log("Se actualizo posicion" + response);
                    actualizo = true;

                });
             }
            },
            
            $scope.cambiarEstadoChofer = function() {
                
                        $ionicLoading.show({
                            template: 'Cambiando...',
                            showBackdrop: false
                        });
                        
                        var action = '';

                        if ($sessionStorage.chofer.status == 'activo') {
                            action = "inactivo";
                        } else if ($sessionStorage.chofer.status == 'inactivo') {
                            action = "activo";
                        } else {
                            action = "activo";
                        }


                        $sails.post("/choferes/estatus", {action: action})
                                .success(function(data, status, headers, jwr) {

                                    $sessionStorage.chofer.status = data.status;

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
                                    
                                    console.log(jwr);
                                    $ionicLoading.hide();
                                    debugger;
                                    if(status == 403 ){
                                        
                                      $state.go('app.login', {}); 
                                      
                                    }
                                    

                                });

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
            $scope.goSeleccionarAuto = function(){
             $state.go('app.selAuto', {});  
            }

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
                }, 
//                {
//                    id: 2,
//                    name: 'Cartera',
//                    level: 0,
//                    icon: '',
//                    state: 'app.cartera'
//                }, {
//                    id: 3,
//                    name: 'Historial de Viajes',
//                    level: 0,
//                    icon: '',
//                    state: 'app.historial'
//                }, {
//                    id: 4,
//                    name: 'Configuracion',
//                    level: 0,
//                    icon: '',
//                    state: 'app.configuracion'
//                },
//                {
//                    id: 4,
//                    name: 'Ayuda',
//                    level: 0,
//                    icon: '',
//                    state: 'app.ayuda'
//                },
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
                $sessionStorage,
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

                if (!$sessionStorage.chofer) {

                    console.error('Error: Falta parametro Chofer.');
                }

                if (!$localStorage.solicitud) {

                    console.error('Error: Falta parametro Solicitud.');
                }



                $sails.post("/choferes/servicio", { solicitud: $localStorage.solicitud, chofer: $sessionStorage.chofer })

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

            AuthService.logout().then(function(response) {
//              $rootScope.watch.clearWatch();
                $state.go('app.login', {});
                
            },function(err){
                
                console.log(err);
                $state.go('app.login', {});
                
            });

        })
        .controller('LoginCtrl', function($scope,
                $cordovaNetwork,
                $ionicHistory,
                $ionicSideMenuDelegate,
                $ionicPlatform,
                AuthService,
                $localStorage,
                $ionicLoading,
                $state,
                $cordovaDialogs) {

            $scope.$storage = $localStorage;

            $ionicSideMenuDelegate.canDragContent(false);

            $ionicPlatform.registerBackButtonAction(function(event) {
                event.preventDefault();
                ionic.Platform.exitApp();
            }, 100);
            
            $scope.validate = function() {
                
                
                if($cordovaNetwork.isOffline()){
                    
                   $cordovaDialogs.alert('Upss, no nos podemos comunicar con la red, compruebe que tenga conexion a internet.','Sin Conexion', 'Aceptar');

                }
                
                
                if($scope.email && $scope.password){
                   
                $ionicLoading.show({
                    template: 'Entrando...',
                    showBackdrop: false
                });
                
                $scope.login();
                    
                }else{
                    
                     $cordovaDialogs.alert('Introduce un usuario y password.', 'An Ride', 'OK')
                            .then(function() {

                            });
                    
                }

            };
            $scope.login = function() {

                AuthService.login($scope.email, $scope.password).then(function(response) {


                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe().then(function(response) {

                        $ionicLoading.hide();
                        $state.go('app.main', {});

                    }, function(err) {
                        $ionicLoading.hide();
                        console.log('AuthService.suscribe()');
                        console.log(err);
                    });

                }, function(err) {
                    
                    $ionicLoading.hide();
                    
                    var error_msg =  err.data.err || 'error en la conexion con el server,intentelo mas tarde';
                    
                            console.log(err);
                    
                    $cordovaDialogs.alert(error_msg, 'An Ride', 'OK')
                            .then(function() {

                            });

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
                $timeout,
                $cordovaLaunchNavigator) {

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
$scope.abrirNavegacion = function(){
    
    
        var longitude = $scope.$storage.solicitud.origen.coords.longitude || 0;
        var latitude = $scope.$storage.solicitud.origen.coords.latitude || 0;
        var destination = [latitude, longitude];
	var start = null;
    $cordovaLaunchNavigator.navigate(destination, start).then(function() {
      console.log("Navigator launched");
    }, function (err) {
      console.error(err);
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
                $interval,
                servicioService) {

            $scope.$storage = $localStorage;
            $scope.tiempo = {};
            $scope.tiempo.horas = 0;
            $scope.tiempo.min = 0;
            $scope.tiempo.segundos = 0;
            $scope.distancia = 0;
            $scope.velocidad = 0;

            $scope.servicio = $localStorage.servicio;
            $scope.solicitud = $localStorage.solicitud;
            $scope.cliente = $localStorage.cliente;

            $scope.terminarViaje = function() {

                $ionicLoading.show({
                    template: 'Terminando Servicio...',
                    showBackdrop: false
                });
                $scope.terminaTrackViaje();
                clearInterval($scope.contadorServicio);
                clearInterval($scope.intervalViaje);
                
                $scope.fin_viaje = {fechaHora: new Date(), posicion: $localStorage.position};
                
//                $localStorage.distancia = 1000;

                $sails.post("/choferes/servicio/final", {servicio: $localStorage.servicio, fin_viaje: $scope.fin_viaje,recorrido:$localStorage.posiciones,distancia:$localStorage.distancia})

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
                $localStorage.solicitud = {};
                $localStorage.cliente = {};
                $state.go('app.main', {});
            }
            $scope.iniciaTrackViaje = function() {

                $scope.positions = [];
                $scope.distancia = 0;
                var sum_distancia = 0;
                var lat1 = null; 
                var lon1 = null;
                var lat2 = null;
                var lon2 = null;
                var d_mts = 0;

               
                document.addEventListener("deviceready", function() {
                     
                    var watchOptions = {
                        
                        maximumAge: 5000,
                        timeout: 30000,
                        enableHighAccuracy: true,
                        priority: 100,
                        interval: 3000,
                        fastInterval: 2000
                    };
                    var cant_positions = 0;
                    var point1 = {};
                    var point2 = {};
                    
                    $scope.watchservicio = cordova.plugins.locationServices.geolocation.watchPosition(function(position) {
                        
                            console.log('Latitude: '          + position.coords.latitude          + '\n' +
                                        'Longitude: '         + position.coords.longitude         + '\n' +
                                        'Altitude: '          + position.coords.altitude          + '\n' +
                                        'Accuracy: '          + position.coords.accuracy          + '\n' +
                                        'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                                        'Heading: '           + position.coords.heading           + '\n' +
                                        'Speed: '             + position.coords.speed             + '\n' +
                                        'Timestamp: '         + position.timestamp                + '\n');
                        
                        $scope.positions.push(position);
                        $scope.speed = position.coords.speed;
                        $scope.accurancy = position.coords.accuracy;
                        $scope.velocidad = position.coords.speed * 3.6;
                       

                        if ($scope.positions.length >= 2) {

                            cant_positions = $scope.positions.length;
                            point1 = $scope.positions[cant_positions - 2];
                            point2 = $scope.positions[cant_positions - 1];

                            lat1 = point1.coords.latitude;
                            lon1 = point1.coords.longitude;
                            lat2 = point2.coords.latitude;
                            lon2 = point2.coords.longitude;

                            servicioService.distancia2points(lat1, lon1, lat2, lon2).then(function(distancia) {

                                d_mts = distancia * 1000;

                                $scope.metros = d_mts;

                                if (d_mts > point1.coords.accuracy) {

                                    sum_distancia = sum_distancia + d_mts;

                                } else {

                                    $scope.positions.splice((cant_positions - 1), 1);

                                }
                                
                        var sum_km = sum_distancia/1000;  
                        $scope.distancia = sum_km.toFixed(2);

                        $localStorage.distancia =  sum_distancia;   
                        $localStorage.posiciones = $scope.positions;

                            });





                        }

                    }, function(err) {
                        alert('Error en el GPS!');
                        console.log(err);
                        
                    }, watchOptions);

                })

                   
                
            },
                    $scope.terminaTrackViaje = function() {
                        
                     cordova.plugins.locationServices.geolocation.clearWatch($scope.watchservicio);
                     
                     
                     
   
                        

                    },
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
        .controller('RegistroCtrl', function ($scope,
                $ionicHistory,
                $ionicLoading,
                $sails,
                $ionicPopup,
                AuthService,
                $rootScope,
                $ionicSideMenuDelegate,
                $state) {

            $scope.validate = function () {
                $ionicLoading.show({
                    template: 'Enviando Informacion de Registro...',
                    showBackdrop: false
                });


                if ($scope.r.email) {

                    $sails.post("/chofer/registro/validar", {email: $scope.r.email})
                            .success(function (val, status, headers, jwr) {

                                if (!val.valido) {
                                    $ionicLoading.hide();
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Ya existe una cuenta con ese email.',
                                        template: 'Por favor entre con su cuenta.'
                                    });

                                    return;

                                } else {
                                    
                                    $scope.registro();
                                }

                            })
                            .error(function (err) {
                                $ionicLoading.hide();
                                console.error(err);

                            });

                }


            }

            $scope.registro = function () {

                AuthService.registro($scope.r)
                        .then(function (response) {

//                            $rootScope.solicitud.chofer = response;
                            $ionicSideMenuDelegate.canDragContent(true);

                            AuthService.suscribe().then(function (response) {
                                $ionicLoading.hide();
                                $state.go('app.main', {});
                            }, function (err) {
                                $ionicLoading.hide();
                            });


                        }, function (err) {
                            $ionicLoading.hide();
                            console.error(err);

                        })

            }



        })
        .controller('AutosCtrl', function ($scope,
                $ionicSideMenuDelegate,
                $ionicHistory,
                choferService,
                $rootScope,
                $localStorage,
                AuthService,
                $sails,
                $state) {
                    
           // $ionicSideMenuDelegate.canDragContent(false);
            
            $scope.autos = [];
            $scope.autoActivo = null;
            $scope.auto_checked = null;

            $scope.getAutos = function () {

                choferService.getAutos().then(function (response) {

                    $scope.autos = response.autos;
                    $scope.autoActivo = response.chofer.autoActivo || null;
                    $localStorage.autoActivo = $scope.autoActivo;

                }, function (err) {

                    console.log(err);


                });

            }();
            

            $scope.checkAutoActivo = function (idAuto) {

                $scope.auto_checked = idAuto;

                $sails.post("/chofer/auto/activar", {idAuto: idAuto})
                        .success(function (data, status, headers, jwr) {

                            $scope.autoActivo = data.autoActivo;
                            $localStorage.autoActivo = data.autoActivo;
                            $state.go('app.main', {});

                        })
                        .error(function (data, status, headers, jwr) {

                         console.error(data);

                        });

            }
            
            $scope.regresarLogin = function(){
                
           AuthService.logout().then(function(response) {
//              $rootScope.watch.clearWatch();
                $state.go('app.login', {});
                
            },function(err){
                
                console.log(err);
                $state.go('app.login', {});
                
            });
            }
            

        })
        