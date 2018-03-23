angular.module('app.controllers', ['ngSails', 'ngCordova'])

        .controller('AppCtrl', function($scope,
                $rootScope,
                $ionicModal,
                $timeout,
                $state,
                $sails,
                AuthService,
                $localStorage,
                $ionicPlatform,
                $ionicPopup,
                $cordovaNetwork) {
                    
            $ionicPlatform.ready(function () {});
                

            $rootScope.solicitud = {
                origen: {},
                destino: {},
                direccion_origen: 'IR AL MARCADOR',
                direccion_destino: 'SE REQUIERE UN DESTINO',
                matrix: {},
                choferesDisponibles: {},
                tipodePago: 'efectivo',
                cliente: {},
                status: 'iniciada',
            };
            
            $scope.platform = ionic.Platform.platform();
            
            // Revisa que se este Authenticado en el servidor.
            
            console.log($rootScope.isGpsEnabled);

            AuthService.isAuthenticated().then(function(response) {
                
                // Si si esta authenticado setea cliente en la solicitud.
                
                //$rootScope.solicitud.cliente = response.cliente;
                
                // Se suscribe al usuario logeado.
                
                  AuthService.suscribe(response.cliente).then(function (response) {

                    //Se busca si hay mensajes pendientes de este cliente.
                    
                        $sails.get('/cliente/mensajes', {})
                        
                                .success(function (data, status, headers, jwr) {
                                    
                                    if($rootScope.isGpsEnabled){
                                        
                                         $state.go('app.map', {});  
               
                                        }

                                 

                                },function(err){
                                    
                                    console.log(err);
                                    
                                });

                    }, function (err) {
                        
                        console.log(err);
                                    
                         if($rootScope.isGpsEnabled){
                                        
                                         $state.go('app.map', {});  
               
                                        }
                        
                    });
                
                

            }, function(err) {
                
                // si no esta auth se abren vista de login.

                $state.go('app.login', {});

            });
            
            
        })
        .controller('MapCtrl', function($scope,
                $rootScope,
                $sails,
                $stateParams,
                $state,
                $ionicLoading,
                $http,
                $cordovaGeolocation,
                $ionicScrollDelegate,
                $ionicNavBarDelegate,
                $ionicPlatform,
                $timeout,
                $interval,
                clienteService,
                choferService,
                solicitudService,
                servicioService,
                $q,
                $ionicPopup,
                $ionicModal,
                $ionicHistory,
                $cordovaToast,
                $localStorage,
                $sessionStorage,
                AuthService,
                $cordovaLocalNotification,
                $cordovaDialogs) {
            
            

            $scope.vistaAlertinicioViaje = 0;
            
            $scope.suscribedEvents = false;
            
            $scope.suscribeServerEvents = function(){
                
                $sails.removeAllListeners();
                                   
                $sails.on('connect', function (data) {

                    // Esto es lo que hace cuando se reconecta al socket.

                    $ionicLoading.hide();

                    AuthService.isAuthenticated().then(function(response) {

                        //$rootScope.solicitud.cliente = response.cliente;

                            AuthService.suscribe(response.cliente).then(function (response) {


                                $sails.get('/cliente/mensajes', {})

                                    .success(function (data, status, headers, jwr) {

                                     // $ionicLoading.hide();

                                    },function(err){
                                        console.log(err);
                                       // $ionicLoading.hide();
                                    });

                        }, function (err) {

                            console.log(err);


                        });



                }, function(err) {

                    // Si se reconecta el socket y no esta auth, te abre la vista de login.

                    $ionicLoading.hide();

                    $state.go('app.login', {});

                });


                });

                $sails.on('disconnect', function(data) {

                    // Esto es lo que hace cuando se pierde la conexion al socket.

                    $scope.disconnect = $ionicLoading.show({
                        template: 'UPS!, Hay problemas para comunicarnos con la red, revisa la conexion...',
                        showBackdrop: false
                    });

                    //// Si se desconecta del socket, se detiene la actualizacion de choferes por intevalos.

                    $interval.cancel($scope.intervalUpdateChoferes);

                    console.log('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');

                });

                $sails.on('servicio.onplace', function(data) {

                    // Esto es lo que se hace cuando el chofer esta en el lugar de origen.

                    // Valido que el servicio sea el mismo.

                    if (data.servicio.id == $localStorage.servicio.id) {

                        $cordovaLocalNotification.schedule({
                            id: 1,
                            title: 'Tu Auto ha Llegado',
                            text: 'El An Ride ha Llegado al punto',
                            data: {
                                customProperty: 'custom value'
                            }
                        }).then(function(result) {

                            console.log(result);

                        },function(err){

                            console.log(err);

                        });

                    }
                });

                $sails.on('servicio.iniciada', function(data) {

                    // Si llega un evento de la cola de mensajes se valida que el servicio no este cancelado o finalizado.
                    var idServicio = data.data.servicio.id || 0;


                    // Valido que el id de servicio sea valido.

                    if (idServicio != 0) {

                        // Actualizo el status del servicio.

                        $sails.get("/cliente/servicio/status", { idServicio: idServicio})
                                .success(function(dataStatus, status, headers, jwr) {

                                    // Si el servicio esta cancelado o finzalizado.

                                    if (dataStatus.status == 'cancelada' || dataStatus.status == 'finalizado') {

                                        // Se detiene la actualizacion de choferes por intevalos.

                                        clearTimeout($rootScope.timeoutSolicitud);

                                        // Se confirma al servidor que el mensaje nos llego.

                                        $sails.post("/cliente/mensaje/confirma", {idQueue: data.id})
                                                .success(function(queue, status, headers, jwr) {


                                                    console.log('El servicio esta cancelado o finalizado');


                                                })
                                                .error(function(data, status, headers, jwr) {

                                                    console.log(data);

                                                });

                                    } else {

                                        // Si el servicio NO esta cancelado o finzalizado.

                                        // Se detiene la actualizacion de choferes por intevalos.

                                        clearTimeout($rootScope.timeoutSolicitud);

                                        // Se confirma al servidor que el mensaje nos llego.

                                        $sails.post("/cliente/mensaje/confirma", {idQueue: data.id})
                                                .success(function(queue, status, headers, jwr) {


                                                    // Se actualizan los datos del storage.
                                            

                                                    $localStorage.chofer = data.data.chofer;
                                                    $localStorage.servicio = data.data.servicio;
                                                    $localStorage.solicitud = data.data.solicitud;
                                                    $scope.$storage = $localStorage;


                                                    $state.go('app.servicio_aprovado', {});


                                                })
                                                .error(function(data, status, headers, jwr) {

                                                    console.log(data);

                                                });


                                    }


                                })
                                .error(function(data, status, headers, jwr) {

                                    console.log(data);

                                });

                    }




                });

                $sails.on('servicio.inicioViaje', function(data) {


                    $sails.post("/cliente/mensaje/confirma", { idQueue: data.id })
                            .success(function(queue, status, headers, jwr) {

                                if ($scope.vistaAlertinicioViaje == 0) {
                                    
                                    $cordovaToast.show('El chofer a iniciado su Viaje.','short', 'center').then(function(){
                                    
                                        $scope.vistaAlertinicioViaje = 1;
                                    
                                    });
                                    
                                }

                                $scope.vistaAlertinicioViaje = 1;

                            })
                            .error(function(data, status, headers, jwr) {

                                console.error(data);

                            });


                });

                $sails.on('servicio.finalizado', function(data) {

                    $cordovaDialogs.alert('Hemos llegado al destino de su servicio, el total es de: $' + data.totales[0].monto.toFixed(2) + ' MXN', 'Servicio Terminado', 'OK');
                    delete $localStorage.servicio;
    //                delete $localStorage.solicitud;
    //                delete $localStorage.chofer;

                    $state.go('app.map', {});

                });

                $sails.on('servicio.cancelado', function(data) {

                    $sails.post("/cliente/mensaje/confirma", {idQueue: data.id})
                            .success(function(queue, status, headers, jwr) {

                                $cordovaDialogs.alert('El servicio ha sido cancelado por el Chofer, por favor vuelva a pedir otro servicio.', 'Servicio Cancelado', 'OK');
                                delete $localStorage.servicio;
                                $state.go('app.map', {});


                            })
                            .error(function(data, status, headers, jwr) {

                                console.log(data);

                            });



                });

                $sails.on('solicitud.creada', function(data) {

                    $ionicLoading.hide();
                    $state.go('app.buscando_chofer', {});

                });

                $sails.on('solicitud', function(data) {

                    console.log('se ejecuto $sails.on "solicitud"');


                });
                                    
            } 
            
           
            $scope.suscribeServerEvents();
                
            $ionicNavBarDelegate.showBackButton(false);

            $scope.choferesDisponibles = {};
            $scope.DestinoBusqueda = {};
            $scope.OrigenBusqueda = {};
            $scope.mostrarDestinosFrecuentes = true;
            $scope.destinosFrecuentes = [];
            $scope.markers = [];
            $scope.choferConfirma = {};
            $scope.intervalUpdateChoferes = {};
            $scope.montoEstimado = 0;
            $scope.status = 'inicio';
            $scope.hidePanels = function(estatus, cb) {

                var d = estatus || 'inicio';

                var call = cb || function() {
                };

                if (d == 'inicio') {

                    $scope.hideBubble = true;
                    $scope.hDestino = true;
                    $scope.hBtnPedir = true;
                    $scope.hCostoEstimado = true;
                    $scope.status = d;

                } else if (d == 'destino') {

                    $scope.hideBubble = true;
                    $scope.hDestino = false;
                    $scope.hBtnPedir = false;
                    $scope.hCostoEstimado = false;
                    $scope.status = d;

                } else if (d == 'center_changed') {

                    $scope.hDestino = true;
                    $scope.status = 'inicio';

                } else if (d == 'origen') {

                    $scope.hideBubble = true;
                    $scope.hDestino = false;
                    $scope.hBtnPedir = true;

                    $scope.status = d;

                } else if ('origen_places') {

                    $scope.hideBubble = true;
                    $scope.hDestino = false;
                    $scope.hBtnPedir = true;
                    $scope.hCostoEstimado = true;
                    $scope.hCostoEstimado = true;
                    $scope.status = d;
                }

                call();

            }

            $scope.hidePanels('inicio');

            $scope.MarkerCoordenadas = {
                tiempoLlegada: null
            };
            
            // Se declaran los vistas modales de cuando de busca in origen.
            
            $ionicModal.fromTemplateUrl('templates/punto_origen.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal_punto_origen = modal;
            },function(err){

                console.log(err);
            });
            
            // Se declaran los vistas modales de cuando de busca in destino.
            
            $ionicModal.fromTemplateUrl('templates/punto_destino.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                
                $scope.modal_punto_destino = modal;
                
            },function(err){
                
                console.log(err);
            });



            $scope.mapCreated = function(map) {

                $scope.map = map;
                $rootScope.map = map;
                
                if (!$localStorage.servicio) {
                    
                    $scope.loading = $ionicLoading.show({
                        template: 'Obteniendo tu ubicacion...',
                        showBackdrop: false
                    });
                }
                

                $cordovaGeolocation.getCurrentPosition({ timeout: 100000, enableHighAccuracy: true })
                        .then(function(position) {

                    $scope.position = position;

                    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

                    $scope.setDireccionOrigen(position).then(function() {

                        $scope.getChoferes().then(function() {

                            $scope.renderChoferesMap().then(function() {
                                
                                $scope.hideBubble = false;
                                
                                $ionicLoading.hide();
                                
                                /// Actualiza choferes en el mapa cada 60 segundos.
                                
                                $scope.intervalUpdateChoferes = $interval(function() {

//                                    $scope.setDireccionOrigen(position).then(function() {
                                        $scope.getChoferes().then(function() {
                                            $scope.renderChoferesMap().then(function() {

                                                console.log('Actualizo choferes en intervalo');

                                            })

                                        })


//                                    })

                                }, 60000);

                            },function(err){
                                
                                console.log(err);
                            });


                        },function(err){
                            
                            console.log(err);
                        });


                    },function(err){
                        
                        console.log(err);
                    });



                    google.maps.event.addListener($scope.map, "dragend", function() {

                        if ($scope.status == 'inicio' || $scope.status == 'origen' || $scope.status == 'origen_places') {

                            $scope.hideBubble = true;

                            $scope.loading = $ionicLoading.show({
                                template: 'Buscando Autos...',
                                showBackdrop: false
                            });

                            $scope.position = {coords: {latitude: $scope.map.getCenter().lat(), longitude: $scope.map.getCenter().lng()}};

                            $scope.setDireccionOrigen($scope.position).then(function() {

                                $scope.getChoferes().then(function() {

                                    $scope.renderChoferesMap().then(function() {

                                        $scope.hidePanels('center_changed');
                                        $scope.hideBubble = false;
                                        $ionicLoading.hide();
                                    })


                                })


                            });
                        }



                    });

                    google.maps.event.addListener($scope.map, "zoom_changed", function() {

                        var center = new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude);

                        $scope.map.setCenter(center);


                    });
                     

                }, function(err) {

                    console.log(err);
                    
                    $ionicLoading.hide();
                    
                    var alertPopup = $ionicPopup.alert({
                        title: 'No tenemos acceso al GPS',
                        template: 'Por favor activa tu GPS!'
                    });

                    alertPopup.then(function(res) {
                        
                        ionic.Platform.exitApp();
                        
                    });
                });



            };
            $scope.getChoferes = function() {

                var q = $q.defer();

                $scope.choferesDisponibles = {};

                choferService.getChoferes($scope.position).then(function(response) {

                    if (response.error) {
                        
                        $scope.clearChoferesMap().then(function() {

                            $ionicLoading.hide();
                            $scope.hideBubble = true;
//                            var alertPopup = $ionicPopup.alert({
//                                title: 'Sin servicio en esta area',
//                                template: 'No contamos con servicio en esta area, disculpe las molestias.'
//                            });

                        })

                        q.reject(response.error);

                    } else {


                        $scope.choferesDisponibles = response;
                        $scope.setLblTiempo(response);
                        q.resolve(response);

                    }


                },function(err){
                    
                    console.log(err);
                });

                return q.promise;
            }
            $scope.setDireccionOrigen = function(position) {
                var q = $q.defer();

                clienteService.getDireccion(position).then(function(response) {

                    var calle = response.data.results[0].address_components[1].long_name;
                    var numero = response.data.results[0].address_components[0].long_name;
                    var colonia = response.data.results[0].address_components[2].long_name;
                    $rootScope.solicitud.direccion_origen = calle + ' ' + numero + ' ' + colonia;
                    q.resolve(response);
                    
                },function(err){
                    
                    console.log(err);
                });

                return q.promise;
            }
            $scope.setLblTiempo = function(response) {

                try {

                    if (response.choferes[0]) {

                        var data = {
                            lat1: response.choferes[0].lat,
                            lon1: response.choferes[0].lon,
                            lat2: $scope.position.coords.latitude,
                            lon2: $scope.position.coords.longitude
                        };

                        $sails.get("/distancia", data)
                                .success(function(data, status, headers, jwr) {

                                    var tiempo = data.rows[0].elements[0].duration.value || 0;
                                    var tiempo_trafico = data.rows[0].elements[0].duration_in_traffic.value || 0;

                                    var tiempo = Math.round((tiempo + tiempo_trafico) / 60)
                                    $scope.MarkerCoordenadas.tiempoLlegada = tiempo + 'Mins';

                                })
                                .error(function(data, status, headers, jwr) {

                                    $scope.MarkerCoordenadas.tiempoLlegada = '--';
                                });

                    }

                } catch (e) {
                    console.log("Error en setLblTiempo: " + e);

                }

            }
            $scope.clearChoferesMap = function() {
                
                var q = $q.defer();

                angular.forEach($scope.markers, function(marker, index) {
                    
                    marker.setMap(null);
                    
                });
                
                $scope.markers = [];

                q.resolve();

                return q.promise;
            }
            $scope.renderChoferesMap = function() {
                var q = $q.defer();

                var image = {
                    url: 'img/car-icon.png',
                    size: new google.maps.Size(32, 32),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 32)
                };
//                            $scope.map.clearMarkers();
                $scope.clearChoferesMap().then(function() {

                    angular.forEach($scope.choferesDisponibles.choferes, function(chofer, index) {

                        console.log('chofer');
                        console.log(chofer);

                        var myLatlng = new google.maps.LatLng(chofer.lat, chofer.lon);

                        $scope.markers[index] = new google.maps.Marker({
                            position: myLatlng,
                            title: chofer.nombre,
                            map: $scope.map,
                            icon: image
                        });


                    });

                    q.resolve();
                })



                return q.promise;
            }
            $scope.centerOnMe = function() {

                $scope.loading = $ionicLoading.show({
                    template: 'Obteniendo tu ubicacion...',
                    showBackdrop: false
                });


                $cordovaGeolocation.getCurrentPosition({timeout: 100000, enableHighAccuracy: true}).then(function(position) {

                    $scope.position = position;
                    $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));

                    $scope.setDireccionOrigen(position).then(function() {

                        $scope.getChoferes().then(function() {

                            $scope.renderChoferesMap().then(function() {

                                $ionicLoading.hide();
                                $scope.hidePanels('inicio', function() {
                                    $scope.hideBubble = false;
                                    $rootScope.solicitud.destino = {};
                                    $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                                });
                            })


                        })


                    });


                }, function(err) {
                    
                    alert('No se recibio posicion del GPS');
                    
                    console.log(err);
                });


            };
            $scope.onSelectOrigen = function() {
                $rootScope.solicitud.origen = $scope.position;
                $scope.hidePanels('origen');
            }
            $scope.close_modal_origen = function() {
                $scope.modal_punto_origen.hide();
            }
            $scope.close_modal_destino = function() {
                
                $scope.modal_punto_destino.hide();
            }
            $scope.searchOrigen = function() {

                $scope.modal_punto_origen.show();

            }
            $scope.searchDestino = function() {
                
                    $ionicLoading.show({
                    template: 'Buscando Destinos...',
                    showBackdrop: false
                    });
                clienteService.getDestinoFrecuentes().then(
                        function(data){
                            console.log(data);
                         $scope.destinosFrecuentes = data.destinos;
                         $ionicLoading.hide();
                        },
                        function(err){
                            
                         $ionicLoading.hide();   
                            
                         console.log(err);
                        }
                        
                        );
                
                
                $scope.modal_punto_destino.show();
            }
            $scope.SearchQueryOrigen = function() {
                
                if ($scope.OrigenBusqueda.query) {
                    
                    
                    
                    clienteService.searchDireccion($scope.OrigenBusqueda.query, $scope.position.coords).then(function(response) {
                        
                        $scope.OrigenResponse = response;
                        
                    }, function(err) {
                        
                        console.log(err);

                    });
                }
            }
            $scope.onSelectItemOrigen = function(place) {
                 
                clienteService.getDireccionDetails(place).then(function(place_detalle) {

                    $scope.position = { coords: { latitude: place_detalle.geometry.location.lat(), longitude: place_detalle.geometry.location.lng()}};

                    $rootScope.solicitud.origen = {coords: {latitude: place_detalle.geometry.location.lat(), longitude: place_detalle.geometry.location.lng()}};
                  
                    $rootScope.solicitud.direccion_origen = place_detalle.formatted_address;


                    $scope.hidePanels('origen_places', function() {

                        $rootScope.solicitud.destino = {};

                        $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';

                        $scope.modal_punto_origen.hide();

                        $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));

                        $scope.getChoferes().then(function() {

                            $scope.renderChoferesMap().then(function() {




                            })


                        })

                    });

                })
            }
            $scope.SearchQueryDestino = function() {
                 
                if ($scope.DestinoBusqueda.query) {
                    
                    clienteService.searchDireccion($scope.DestinoBusqueda.query, $scope.solicitud.origen.coords).then(function(response) {
                        
                        $scope.DestinoResponse = response;
                        $scope.mostrarDestinosFrecuentes = false;
                        
                    }, function(err) {
                        
                        console.log(err);
                    });

                }else{
                  $scope.DestinoResponse = [];
                  $scope.mostrarDestinosFrecuentes = true;  
                }


            }
            $scope.calcularEstimado = function() {
                
                var q = $q.defer();

                $scope.loading = $ionicLoading.show({
                    template: 'Recuperando Precios...',
                    showBackdrop: false
                });
                
                

                clienteService.getDistancia($scope.solicitud).then(function(response) {

                    $rootScope.solicitud.matrix = response;
                   
                    try {

                        var matrix_tiempo = response.data.rows[0].elements[0].duration.value || 0;
                        
                        var matrix_distancia = response.data.rows[0].elements[0].distance.value || 0;

                    } catch (e) {

                        console.error(e);

                    }


                    clienteService.getEstimacionMonto(matrix_distancia, matrix_tiempo).then(function(response) {
                        
                        $scope.montoEstimado = response.data.montoEstimado;

                        q.resolve(response);
                        
                    }, function(err) {
                        
                        q.reject(err);
                        
                        console.error(err);
                    });

                }, function(err) {

                    console.error(err);
                    
                    q.reject(err);

                });

                return q.promise;
            }
            $scope.onSelectItemDestino = function(place) {

                clienteService.getDireccionDetails(place).then(function(place_detalle) {
                   

                    $rootScope.solicitud.destino = {
                        coords: {
                            latitude: place_detalle.geometry.location.lat(),
                            longitude: place_detalle.geometry.location.lng()
                        }};

                    $rootScope.solicitud.direccion_destino = place_detalle.formatted_address;
                    
                    
                    $interval.cancel($scope.intervalUpdateChoferes);

                    $scope.calcularEstimado().then(function(response) {

                        $ionicLoading.hide();
                        
                        clienteService.saveDestinoFrecuente(place_detalle).then(function(resp){
                            
                            console.log('Se guardo destino frecuente');
                            console.log(resp);
                            
                        },function(err){
                            
                            console.log(err);
                        });
                        
                        $scope.hidePanels('destino', function() {

                            $scope.modal_punto_destino.hide();
                            $scope.solicitud.choferesDisponibles = $scope.choferesDisponibles;
                        });

                    },function(err){
                        
                        $ionicLoading.hide();
                        alert('Upss , ocurrio un error al calcular estimacion.');
                    });

                },function(err){
                    
                    console.log(err);
                });

            };
            $scope.crearsolicitud = function() {
                
             $interval.cancel($scope.intervalUpdateChoferes);
             
                // valido informacion para crear la solicitud.

                var solicitud = $rootScope.solicitud;
                    
                    solicitud.cliente = $sessionStorage.session;
                
                if (!solicitud.origen.coords) {
                    
                    
                    console.error('El origen no puede ir vacio');

                    $ionicPopup.alert({
                        title: 'Error 1',
                        template: 'Upps, Lo sentimos,ocurrrio un error fatal, intentalo mas tarde...'
                    }).then(function() {
                        $scope.hidePanels('inicio', function() {
                            $scope.hideBubble = false;
                            $rootScope.solicitud.destino = {};
                            $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            $state.go('app.map', {});
                        });

                    })

                } else if (!solicitud.destino.coords) {
                    
                    console.log('El destino no puede ir vacio');
                    $ionicPopup.alert({
                        title: 'Error 2',
                        template: 'Upps, Lo sentimos,ocurrrio un error fatal, intentalo mas tarde...'
                    }).then(function() {
                        $scope.hidePanels('inicio', function() {
                            $scope.hideBubble = false;
                            $rootScope.solicitud.destino = {};
                            $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            $state.go('app.map', {});
                        });

                    })

                } else if (!solicitud.cliente) {
                    
                    console.log('El cliente no puede ir vacio');
                    $ionicPopup.alert({
                        title: 'Error 3',
                        template: 'Upps, Lo sentimos,ocurrrio un error fatal, intentalo mas tarde...'
                    }).then(function() {
                        $scope.hidePanels('inicio', function() {
                            $scope.hideBubble = false;
                            $rootScope.solicitud.destino = {};
                            $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            $state.go('app.map', {});
                        });

                    })

                } else if (!$rootScope.solicitud.choferesDisponibles.choferes) {


                    console.log('Se debe de tener al menos un chofer disponible');

                    $ionicPopup.alert({
                        title: 'Error 4',
                        template: 'Upps, Lo sentimos,ocurrio un error fatal, intentalo mas tarde...'
                    }).then(function() {
                        $scope.hidePanels('inicio', function() {
                            $scope.hideBubble = false;
                            $rootScope.solicitud.destino = {};
                            $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            $state.go('app.map', {});
                        });

                    })

                } else if (!$rootScope.solicitud.choferesDisponibles.choferes.length > 0) {


                    console.log('Se debe de tener al menos un chofer disponible');

                    $ionicPopup.alert({
                        title: 'Error 5',
                        template: 'Upps, Lo sentimos,ocurrrio un error fatal, intentalo mas tarde...'
                    }).then(function() {
                        $scope.hidePanels('inicio', function() {
                            $scope.hideBubble = false;
                            $rootScope.solicitud.destino = {};
                            $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            $state.go('app.map', {});
                        });

                    })

                } else {

                    $scope.loading = $ionicLoading.show({
                        template: 'Enviando Solicitud...',
                        showBackdrop: false
                    });

                   
                    $localStorage.solicitud = solicitud;

                    $rootScope.timeoutSolicitud = setTimeout(function() {




                        $ionicPopup.alert({
                            title: 'No contamos con choferes disponibles',
                            template: 'es este momento, por favor intentalo mas tarde...'
                        }).then(function() {
                            $scope.hidePanels('inicio', function() {
                                $scope.hideBubble = false;
                                $rootScope.solicitud.destino = {};
                                $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                                $state.go('app.map', {});
                            });

                        })

                    }, 90000);

                    solicitudService.sendSolicitud(solicitud).then(function(response) {
                        
                        
                        clearTimeout($rootScope.timeoutSolicitud);

                        if (response.respuesta.respuesta != 'aceptada') {

                            $ionicLoading.hide();
                            $state.go('app.map', {});

                            var alertPopup = $ionicPopup.alert({
                                title: 'No contamos con choferes disponibles',
                                template: 'es este momento, por favor intentalo mas tarde...'
                            });

                            alertPopup.then(function(res) {

                                $scope.hidePanels('inicio', function() {
                                    $scope.hideBubble = false;
                                    $rootScope.solicitud.destino = {};
                                    $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                                });

                            })
                        } else {
                            
                            console.log(response.respuesta.respuesta);
                        }


                    }, function(err) {

                        console.log(err);
                       
                        
                        $ionicPopup.alert({
                            title: 'No contamos con choferes disponibles',
                            template: 'es este momento, por favor intentalo mas tarde...'
                        }).then(function() {
                            
                            $scope.hidePanels('inicio', function() {
                                $scope.hideBubble = false;
                                $rootScope.solicitud.destino = {};
                                $rootScope.solicitud.direccion_destino = 'SE REQUIERE UN DESTINO';
                            });

                        })

                    })

                }

            }

            $scope.$on('$ionicView.beforeEnter', function(event, data) {

              /*  if ($localStorage.cliente.id) {

                    AuthService.suscribe().then(function(response) {

                        console.log(response);

                        $sails.get('/cliente/mensajes', {})
                                .success(function(data, status, headers, jwr) {

                                    $ionicLoading.hide();

                                })

                    }, function(err) {

                    });

                }*/


//                    $ionicPlatform.registerBackButtonAction(function(event) {
//                        
//                        event.preventDefault();
//                      ionic.Platform.exitApp();
//                    }, 100);


            })
            $scope.$on('$ionicView.afterEnter', function(event, data) {


//              Si el usuario tiene un servicio en proceso.

                servicioService.getSolicitudPendiente().then(function(response) {
                    
                    

                    if (response.length > 0) {

                        $localStorage.servicio = response[0];
                        $localStorage.chofer = response[0].chofer;


                        $sails.get("/cliente/solicitud", {SolId: response[0].solicitud})
                                .success(function(response, status, headers, jwr) {

                                    $localStorage.solicitud = response;

                                    $state.go('app.servicio_aprovado', {});

                                })
                                .error(function(err) {
                                    console.error(err);
                                });
                    }

                })


//                $interval(function() {
//                    console.log('se ejecuto mensajes');
//                    $sails.get('/cliente/mensajes', {})
//                            .success(function(data, status, headers, jwr) {
//
//                                $ionicLoading.hide();
//
//                            })
//
//
//                }, 30000);

            })
            
             
            

        })
        .controller('SideMenuCtrl', function($scope, 
                $ionicHistory) {
            $scope.theme = 'ionic-sidemenu-dark';
            $scope.tree1 = [];
            $scope.tree = [{
                    id: 1,
                    name: 'Inicio',
                    icon: "",
                    level: 0,
                    state: 'app.map'
                }, {
                    id: 2,
                    name: 'Viajes',
                    level: 0,
                    icon: '',
                    state: 'app.viajes'
                },
//                {
//                    id: 3,
//                    name: 'Pagos',
//                    level: 0,
//                    icon: '',
//                    state: 'app.pagos'
//                },
//                {
//                    id: 4,
//                    name: 'Notificaciones',
//                    level: 0,
//                    icon: '',
//                    state: 'app.notificaciones'
//                },
//                {
//                    id: 5,
//                    name: 'Destinos Guardados',
//                    level: 0,
//                    icon: '',
//                    state: 'app.destinos'
//                },
                {
                    id: 6,
                    name: 'Configuracion',
                    level: 0,
                    icon: '',
                    state: 'app.configuracion'
                },
                {
                    id: 7,
                    name: 'Ayuda',
                    level: 0,
                    icon: '',
                    state: 'app.ayuda'
                },
                {
                    id: 8,
                    name: 'Salir',
                    level: 0,
                    icon: '',
                    state: 'app.logout'
                }

            ];


        })
        .controller('LoginCtrl', function($scope, 
                $rootScope, 
                $localStorage, 
                $ionicSideMenuDelegate, 
                $ionicPlatform, 
                AuthService, 
                $state, 
                $ionicLoading, 
                $ionicPopup) {

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
                
                $scope.loading = $ionicLoading.show({
                    template: 'Validando...',
                    showBackdrop: false
                });
                
                AuthService.login($scope.email, $scope.password).then(function(response) {

                    //$rootScope.solicitud.cliente = response;
                    
                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe(response).then(function(response) {
                        
                        $ionicLoading.hide();
                        $state.go('app.map', {});
                        
                    }, function(err) {
                        
                        console.log('Error en suscribe linea 1135');
                        console.log(err);
                        $ionicLoading.hide();
                        $state.go('app.map', {});
                    });


                }, function(err) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'No valido',
                        template: 'Usuario o contraseña invalidos!, intentalo nuevamente'
                    });
                })

            };

            $scope.showAlert = function() {
                var alertPopup = $ionicPopup.alert({
                    title: 'Don\'t eat that!',
                    template: 'It might taste good'
                });
            }

        })
        .controller('DestinoCtrl', function($scope, 
                $rootScope, 
                $ionicSideMenuDelegate, 
                clienteService, 
                $state, 
                $ionicNavBarDelegate, 
                $ionicHistory) {

//            $scope.solicitud = $rootScope.solicitud;
//            $ionicNavBarDelegate.showBackButton(true);
//
//            $ionicSideMenuDelegate.canDragContent(false);


//            $scope.onSearchQueryChange = function() {
//
//                $scope.$watch('busqueda', function(newValue) {
//
//                    if (newValue) {
//
//                        clienteService.searchDireccion(newValue, $scope.solicitud.origen.coords).then(function(response) {
//                            $scope.response = response;
//                        }, function() {
//
//                        });
//
//                    }
//
//                });
//            }
//
//            $scope.onSelectItemDestino = function(place) {
//
//                clienteService.getDireccionDetails(place).then(function(place_detalle) {
//
//                    $rootScope.solicitud.destino = {
//                        coords: {
//                            latitude: place_detalle.geometry.location.lat(),
//                            longitude: place_detalle.geometry.location.lng()
//                        }};
//                    $rootScope.solicitud.direccion_destino = place_detalle.formatted_address;
//                    $rootScope.seleccionoDestino = true;
//
//                    $rootScope.$broadcast('seleccione_destino');
//
//                    $state.go('app.map');
//                })
//
//            }

        })
        .controller('DriverCtrl', function($scope, 
                $ionicHistory, 
                $localStorage, 
                $sails,
                $cordovaGeolocation,
                $state,
                $interval,
                $q,
                $cordovaDialogs) {
                    
            $scope.map = {};        
            $scope.imageChofer = {
                url: 'img/car-icon.png',
                size: new google.maps.Size(32, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 32)};
            
            $scope.imageMyLoc = new google.maps.MarkerImage('https://maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                    new google.maps.Size(22,22),
                                                    new google.maps.Point(0,18),
                                                    new google.maps.Point(11,11));
            
            $scope.solicitud = $localStorage.solicitud;
            
            $scope.latLng_chofer = null;

            $scope.latLng_me = null;
            
            $scope.marker_chofer = null;
            $scope.marker_my_loc = null;
            
            try{
                $scope.latLng_origen = new google.maps.LatLng( $scope.solicitud.origen.coords.latitude, $scope.solicitud.origen.coords.longitude);
                $scope.latLng_destino = new google.maps.LatLng( $scope.solicitud.destino.coords.latitude, $scope.solicitud.destino.coords.longitude);
                
                }catch(e){

                    console.log(e);

                }
            
            var intervalChofer;
            $scope.directionsService = new google.maps.DirectionsService;
            $scope.directionsDisplay = new google.maps.DirectionsRenderer;
            
            $scope.createMap = function(choferId){
                
            $sails.post("/clientes/chofer", { choferId: choferId })
                        .success(function(data, status, headers, jwr) {
                                                
                            $scope.latLng_chofer = new google.maps.LatLng(data.location.coordinates[1], data.location.coordinates[0]);
                            
                            $scope.map = new google.maps.Map(document.getElementById("map_driver"), {
                                                                                                    center:$scope.latLng_chofer,
                                                                                                    zoom: 15,
                                                                                                    disableDefaultUI: true,
                                                                                                    mapTypeId: google.maps.MapTypeId.ROADMAP
                                                                                                     });         
                            
                            $scope.map.setClickableIcons(false);
                            
                            $scope.marker_chofer = new google.maps.Marker({
                                                           map: $scope.map,
                                                           animation: google.maps.Animation.DROP,
                                                           icon:$scope.imageChofer,
                                                           position: $scope.latLng_chofer
                                                       });
                                                       
                            $scope.marker_my_loc = new google.maps.Marker({
                                                            map: $scope.map,
                                                            clickable: false,
                                                            icon:$scope.imageMyLoc,
                                                            shadow: null,
                                                            zIndex: 999});
                                                        
                            $scope.getMyLocation().then(function(position){
                                
                                $scope.latLng_me = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                                
                                $scope.marker_my_loc.setPosition($scope.latLng_me);
                                
                            },function(err){
                                console.log(err);
                                alert('Err en GPS');
                            });

                                $scope.intervalUpdateMarker();
                                

                        })
                        .error(function(data, status, headers, jwr) {

                            console.error(data);

                        });
                
             
               
                
            };
            $scope.calculateAndDisplayRoute = function () {
                
                        $scope.directionsDisplay.setMap($scope.map);    
                
                        $scope.directionsService.route({
                           origin: $scope.latLng_origen,
                           destination: $scope.latLng_destino,
                           travelMode: 'DRIVING'
                         }, function(response, status) {
                             
                           if (status === 'OK') {
                               
                             $scope.directionsDisplay.setDirections(response);
                             
                           } else {
                               
                             alert('Directions request failed due to ' + status);
                           }
                         });
                
                
                
            }
            $scope.intervalUpdateMarker = function(){ 
                
                intervalChofer = $interval(function() {

                        $sails.post("/clientes/chofer", { choferId:$scope.choferId })
                                  .success(function(data, status, headers, jwr) {

                                      $scope.latLng_chofer = new google.maps.LatLng(data.location.coordinates[1], data.location.coordinates[0]);

                                      $scope.clearMapMarkers(function(){

                                       $scope.marker_chofer.setPosition($scope.latLng_chofer); 
                                       $scope.marker_chofer.setMap($scope.map);
                                       $scope.map.panTo($scope.latLng_chofer);
                                       
                                         $scope.getMyLocation().then(function(position){
                                
                                                    $scope.latLng_me = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                                                    $scope.marker_my_loc.setPosition($scope.latLng_me);
                                                    $scope.marker_my_loc.setMap($scope.map);

                                                },function(err){
                                                    console.log(err);
                                                    alert('Err en GPS');
                                                });
                                       

                                      });        


                                  })
                                  .error(function(data, status, headers, jwr) {

                                      console.error(data);

                                  });



            },30000);
            
            }
            $scope.stopintervalUpdateMarker = function(){
                
               $interval.cancel(intervalChofer); 
            }
            $scope.clearMapMarkers = function(cb){
                
              $scope.marker_chofer.setMap(null);
              $scope.marker_my_loc.setMap(null);
              cb();
 
            }
            $scope.cancelarServicio = function() {

                $cordovaDialogs.confirm('Esta Seguro de Cancelar el Servicio', 'Cancelar Viaje', ['SI', 'NO'])

                        .then(function(buttonIndex) {

                            var btnIndex = buttonIndex;

                            if (btnIndex == 1) {

                                var data = {servicioId: $localStorage.servicio.id};

                                $sails.post("/clientes/servicio/cancel", data)
                                        .success(function(data, status, headers, jwr) {
                                            $sails.off('chofer', function() {

                                            });

                                            delete $localStorage.servicio;
                                            delete $localStorage.chofer;
                                            $state.go('app.map', {});
//                                            $scope.centerOnMe();
//                                            $scope.hidePanels('inicio');

                                        })
                                        .error(function(data, status, headers, jwr) {
                                            console.error(data);
                                        });
                            }

                        });
            };
            $scope.getMyLocation = function(){
                
                var deferred = $q.defer();
                
              $cordovaGeolocation.getCurrentPosition({timeout: 100000, enableHighAccuracy: true}).then(function(position) {
                   
                        deferred.resolve(position); 

                       },function(err){

                        deferred.reject(err);   

                       });
                       
                return deferred.promise;
            }
            
            $scope.$storage = $localStorage;
            $scope.choferId = $localStorage.chofer.id;  
            $scope.createMap($scope.choferId);
            
            $scope.$on('$destroy',function(){
                console.log('SE DESTRUYO EL SCOPE');
                $scope.stopintervalUpdateMarker();
                
                
            });
            $sails.on('servicio.inicioViaje', function(data) {
                
               $scope.calculateAndDisplayRoute(); 
                
            });

        })
        .controller('ViajesCtrl', function($scope, 
                $ionicHistory, 
                $sails) {

            $scope.init = function() {

                $sails.get("/cliente/viajes", {})
                        .success(function(data, status, headers, jwr) {


                            $scope.records = data;


                        })
                        .error(function(data, status, headers, jwr) {



                            console.error(data);
                        })
            }



            $scope.init();

        })
        .controller('PagosCtrl', function($scope, 
                $ionicHistory, 
                $ionicModal, 
                moment) {

            $scope.anio = parseInt(moment().format('YYYY'));
            $scope.card = {};
            $scope.formas_pago = [];
            
            $scope.formas_pago.push({id:0,value:'efectivo',title:'Pago en Efectivo',subtitle:'(MXN)'});
            
            $ionicModal.fromTemplateUrl('templates/add_tarjeta.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {

                $scope.modal_add_tarjeta = modal;
            });


            $scope.getFormasPago = function() {

            }
            
            $scope.addFormaPago = function() {
                $scope.modal_add_tarjeta.show();

            }

            $scope.create_token = function() {

                $scope.card.address = {};

                if (!Conekta.card.validateNumber($scope.card.number)) {
                    alert('el numero de tarjeta no es valido.');
                    return;
                }

                if (!Conekta.card.validateExpirationDate($scope.card.exp_month, $scope.card.exp_year)) {
                    alert('el fecha de expìracion no es valido.');
                    return;
                }

                if (!Conekta.card.validateCVC($scope.card.cvc)) {
                    alert('el codigo de seguridad no es valido.');
                    return;
                }
                $scope.last_num = $scope.card.number[13],$scope.card.number[12],$scope.card.number[13],$scope.card.number[14];
                
                $scope.card_brand = Conekta.card.getBrand($scope.card.number); 

                var tokenParams = {card: $scope.card};


                Conekta.token.create(tokenParams, $scope.successResponseHandler, $scope.errorResponseHandler);


            }
            $scope.successResponseHandler = function(token) {
                console.log(token);
              
              $sails.post("/cliente/pay/add",{data:{token:token,last_nums:$scope.last_num,card_brand:$scope.card_brand}})
              
              
            }

            $scope.errorResponseHandler = function(err) {
                console.log(err);
                
            }


        })
        .controller('LogoutCtrl', function($scope, 
                $ionicHistory, 
                AuthService, 
                $state) {

            AuthService.logout().then(function() {
                
                $state.go('app.login', {});
                
            },function(err){
                
                console.log(err);
            });

        })
        .controller('NotificacionesCtrl', function($scope, 
                $ionicHistory) {



        })
        .controller('ConfiguracionCtrl', function($scope, 
                $ionicHistory) {
                    
                    
                    
                    



        })
        .controller('CancelCtrl', function($scope, 
                $ionicHistory) {

            var razones = [{id: 1, title: ""}]


        })
        .controller('BuscandoCtrl', function($scope, 
                $ionicHistory) {



        })
        .controller('RegistroCtrl', function($scope, 
                $ionicHistory, 
                $sails, 
                $ionicPopup, 
                AuthService, 
                $rootScope, 
                $ionicSideMenuDelegate, 
                $ionicLoading, 
                $state,
                $cordovaToast) {
                    
            $scope.alertPopup;

            $scope.validate = function(form_registro) {
                
              $ionicLoading.show({
                    template: 'Enviando Informacion ...',
                    showBackdrop: false
                });
                
                
                if(!form_registro.txtRegNombre.$valid){
                    
                   $ionicLoading.hide();
                   
                   $scope.alertPopup = $ionicPopup.alert({
                       title: 'El nombre no es valido.',
                       template: 'Por favor introduce un nombre valido.'
                   });

                   return false;   
                    
                }
                
                if(!form_registro.txtRegApellido.$valid){
                    
                   $ionicLoading.hide();
                   
                   $scope.alertPopup = $ionicPopup.alert({
                       title: 'El apellido no es valido.',
                       template: 'Por favor introduce un apellido valido.'
                   });

                   return false;   
                    
                }
                
                if(!form_registro.txtRegCelular.$valid){
                    
                   $ionicLoading.hide();
                   
                   $scope.alertPopup = $ionicPopup.alert({
                       title: 'El celular no es valido.',
                       template: 'Por favor introduce un celular valido. (min 8 caracteres)'
                   });

                   return false;   
                    
                }
                
                if(!form_registro.txtRegEmail.$valid){
                    
                   $ionicLoading.hide();
                   
                   $scope.alertPopup = $ionicPopup.alert({
                       title: 'El email no es valido.',
                       template: 'Por favor introduce un email valido.'
                   });

                   return false;   
                    
                }
                
                 if(!form_registro.txtRegPassword.$valid){
                    
                   $ionicLoading.hide();
                   
                   $scope.alertPopup = $ionicPopup.alert({
                       title: 'El password no es valido.',
                       template: 'Por favor introduce un password valido. (min 4 caracteres)'
                   });

                   return false;   
                    
                }
                

                if ($scope.r.email) {
                    
                    // Comprobamos que el email no este registrado.
                    
                    var celular = $scope.r.celular;
                    var email = $scope.r.email;
                 
                    $sails.post("/cliente/registro/validar", { email:email, numCel:celular})
                            .success(function(val, status, headers, jwr) {
                                
           
                                
                                if (!val.numCelValido) {
                                    
                                    //Si no es valido muestra alert y no continua
                                    $ionicLoading.hide();
                                    
                                    $scope.alertPopup = $ionicPopup.alert({
                                        title: 'Ya existe una cuenta con ese numero de celular.',
                                        template: 'Por favor, capture otro numero.'
                                    });

                                    return false;

                                } 

                                if (!val.emailValido) {
                                    
                                    //Si no es valido muestra alert y no continua
                                    $ionicLoading.hide();
                                    
                                    $scope.alertPopup = $ionicPopup.alert({
                                        title: 'Ya existe una cuenta con ese email.',
                                        template: 'Por favor , capture otro email.'
                                    });

                                    return false;

                                } 
                                

                                   // Si no esta registrado continua con el registro.
                                    
                                    $scope.registro(form_registro);
                                    
                                

                            })
                            .error(function(err) {
                                
                                $ionicLoading.hide();
                        
                                $scope.alertPopup = $ionicPopup.alert({
                                        title: 'Error.',
                                        template: 'Ups, Ocurrio un error en la validacion de email, intentelo mas tarde.'
                                    });
                                    
                                console.error(err);

                            });

                }


            }

            $scope.registro = function(form_registro) {

                AuthService.registro($scope.r)
                        .then(function(response) {

                            //$rootScope.solicitud.cliente = response;
                    
                            $ionicSideMenuDelegate.canDragContent(true);

                            AuthService.suscribe(response).then(function(resp) {
                                
                                $ionicLoading.hide();
                                
                                $cordovaToast.show('Se creo su cuenta con exito.','short','center').then(function(){
                                    
                                    $state.go('app.map', {});
                                    
                                });
                                
                                
                                
                            }, function(err) {
                                
                                console.error(err);
                                
                                $ionicLoading.hide();
                                
                                $scope.alertPopup = $ionicPopup.alert({
                                        title: 'Se creo tu cuenta',
                                        template: 'Por favor ingresa con tus datos.'
                                    });
                                
                                $state.go('app.login', {});
                                
                            });


                        }, function(err) {
                            
                            $ionicLoading.hide();
                            $scope.alertPopup = $ionicPopup.alert({
                                        title: 'Error',
                                        template: 'Ups,ocurrio un error en el registro, intantalo mas tarde.'
                                    });
                            console.error(err);

                        });

            }

        })

