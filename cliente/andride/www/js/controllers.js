angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, AuthService, $localStorage, $cordovaNetwork) {


            $rootScope.seleccionoDestino = false;

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

            AuthService.isAuthenticated().then(function(response) {
                $rootScope.solicitud.cliente = $localStorage.cliente;
                $state.go('app.map', {});

            }, function(err) {

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
                $localStorage,
                AuthService,
                $cordovaLocalNotification,
                $cordovaDialogs) {




            $scope.intervalReconnect = {};

            $sails.on('connect', function(data) {

                if ($localStorage.cliente.id) {

                    AuthService.suscribe().then(function(response) {
                        console.log(response);
                    });

                }


            });

            $sails.on('disconnect', function(data) {

//                alert('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');

            });

            $sails.on('servicio.onplace', function(data) {

                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: 'Tu Auto ha Llegado',
                    text: 'El An Ride ha Llegado al punto',
                    data: {
                        customProperty: 'custom value'
                    }
                }).then(function(result) {
                    console.log(result);
                });


            });

            $sails.on('servicio.iniciada', function(data) {

                $localStorage.chofer = data.chofer;
                $localStorage.servicio = data.servicio;

                $scope.$storage = $localStorage;

                $state.go('app.servicio_aprovado', {});

            });

            $sails.on('servicio.finalizado', function(data) {

                $cordovaDialogs.alert('Hemos llegado al destino de su servicio, el total es de: $' + data.totales[0].monto + ' MXN', 'Servicio Terminado', 'OK');
                delete $localStorage.servicio;
//                delete $localStorage.solicitud;
//                delete $localStorage.chofer;

                $state.go('app.map', {});

            });

            $sails.on('servicio.cancelado', function(data) {
                $cordovaDialogs.alert('El servicio ha sido cancelado por el Chofer, por favor vuelva a pedir otro servicio.', 'Servicio Cancelado', 'OK');
                delete $localStorage.servicio;
                $state.go('app.map', {});

            });

            $sails.on('solicitud.creada', function(data) {
                $ionicLoading.hide();
                $state.go('app.buscando_chofer', {});

            });

            $sails.on('solicitud', function(data) {




            });

            $ionicNavBarDelegate.showBackButton(false);

            $scope.choferesDisponibles = {};
            $scope.DestinoBusqueda = {};
            $scope.OrigenBusqueda = {};
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
            $ionicModal.fromTemplateUrl('templates/punto_origen.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal_punto_origen = modal;
            });
            $ionicModal.fromTemplateUrl('templates/punto_destino.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal_punto_destino = modal;
            });



            $scope.mapCreated = function(map) {

                $scope.map = map;
                if (!$localStorage.servicio) {
                    $scope.loading = $ionicLoading.show({
                        template: 'Obteniendo tu ubicacion...',
                        showBackdrop: false
                    });
                }
                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

                    $scope.position = position;
                    $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));

                    $scope.setDireccionOrigen(position).then(function() {

                        $scope.getChoferes().then(function() {

                            $scope.renderChoferesMap().then(function() {
                                $scope.hideBubble = false;
                                $ionicLoading.hide();

                                $scope.intervalUpdateChoferes = $interval(function() {

                                    $scope.setDireccionOrigen(position).then(function() {
                                        $scope.getChoferes().then(function() {
                                            $scope.renderChoferesMap().then(function() {

                                                console.log('Actualizo choferes en intervalo');

                                            })

                                        })


                                    })

                                }, 30000);

                            })


                        })


                    });



                    google.maps.event.addListener($scope.map, "dragend", function() {

                        if ($scope.status == 'inicio' || $scope.status == 'origen' || $scope.status == 'origen_places') {

                            console.log('se ejecuto dragend');

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

                })

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

                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

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

                $scope.modal_punto_destino.show();
            }
            $scope.SearchQueryOrigen = function() {
                if ($scope.OrigenBusqueda.query) {
                    clienteService.searchDireccion($scope.OrigenBusqueda.query, $scope.position.coords).then(function(response) {
                        $scope.OrigenResponse = response;
                    }, function() {

                    });
                }
            }
            $scope.onSelectItemOrigen = function(place) {

                clienteService.getDireccionDetails(place).then(function(place_detalle) {

                    $scope.position = {coords: {latitude: place_detalle.geometry.location.lat(), longitude: place_detalle.geometry.location.lng()}};

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
                    }, function() {

                    });

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

                    var matrix_tiempo = response.data.rows[0].elements[0].duration.value;
                    var matrix_distancia = response.data.rows[0].elements[0].distance.value;

                    clienteService.getEstimacionMonto($rootScope.solicitud, matrix_distancia, matrix_tiempo).then(function(response) {
                        $scope.montoEstimado = response.data.montoEstimado;

                        q.resolve(response);
                    });

                })

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
                        $scope.hidePanels('destino', function() {

                            $scope.modal_punto_destino.hide();
                            $scope.solicitud.choferesDisponibles = $scope.choferesDisponibles;
                        });

                    });




                })

            };
            $scope.crearsolicitud = function() {


                // valido informacion para crear la solicitud.

                var solicitud = $rootScope.solicitud;

                console.log($rootScope.solicitud);


                if (!solicitud.origen.coords) {
                    console.log('El origen no puede ir vacio');
                } else if (!solicitud.destino.coords) {
                    console.log('El destino no puede ir vacio');
                } else if (!solicitud.destino.coords) {
                    console.log('El cliente no puede ir vacio');
                } else {

                    $scope.loading = $ionicLoading.show({
                        template: 'Enviando Solicitud...',
                        showBackdrop: false
                    });
                    $localStorage.solicitud = $rootScope.solicitud;
                    solicitudService.sendSolicitud(solicitud).then(function(response) {

                        if (response.respuesta != 'aceptada') {

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
                        }

                    })

                }

            }


            $scope.$on('$ionicView.beforeEnter', function(event, data) {

//                    $ionicPlatform.registerBackButtonAction(function(event) {
//                        debugger;
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
                                    console.log(err);
                                });
                    }

                })




            })

        })
        .controller('SideMenuCtrl', function($scope, $ionicHistory) {



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
                {
                    id: 3,
                    name: 'Pagos',
                    level: 0,
                    icon: '',
                    state: 'app.pagos'
                },
                {
                    id: 4,
                    name: 'Notificaciones',
                    level: 0,
                    icon: '',
                    state: 'app.notificaciones'
                },
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
        .controller('LoginCtrl', function($scope, $rootScope, $localStorage, $ionicSideMenuDelegate, $ionicPlatform, AuthService, $state, $ionicLoading, $ionicPopup) {

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

                    $rootScope.solicitud.cliente = response;
                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe().then(function(response) {
                        $ionicLoading.hide();
                        $state.go('app.map', {});
                    }, function() {
                        $ionicLoading.hide();
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
        .controller('DestinoCtrl', function($scope, $rootScope, $ionicSideMenuDelegate, clienteService, $state, $ionicNavBarDelegate, $ionicHistory) {

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
        .controller('DriverCtrl', function($scope, $ionicHistory, $localStorage, $sails, $state, $cordovaDialogs) {

            $scope.updateMarkerServicio = function(choferId) {

                var markerChoferServicio = {};

                markerChoferServicio.setMap = function() {

                };

                $sails.post("/clientes/suscribe/chofer", {choferId: choferId})
                        .success(function(data, status, headers, jwr) {

                            var imageChofer = {
                                url: 'img/car-icon.png',
                                size: new google.maps.Size(32, 32),
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(0, 32)
                            };

                            $sails.on('chofer', function(data) {

                                markerChoferServicio.setMap(null);

                                var lat = data.data.chofer.lat || 0;
                                var lon = data.data.chofer.lon || 0;
                                var latLngChofer = new google.maps.LatLng(lat, lon);

                                markerChoferServicio = new google.maps.Marker({
                                    position: latLngChofer,
                                    title: '',
                                    map: $scope.mapa_chofer,
                                    icon: imageChofer
                                });

                            })

                        })
                        .error(function(data, status, headers, jwr) {


                        });



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
                                        });

                            }


                        });
            }

            $scope.$storage = $localStorage;

            var latLngChofer = new google.maps.LatLng($localStorage.solicitud.origen.coords.latitude, $localStorage.solicitud.origen.coords.longitude);

            var mapOptions = {
                center: latLngChofer,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                draggable: false
            };

            $scope.mapa_chofer = new google.maps.Map(document.getElementById("mapa_chofer"), mapOptions);

            $scope.mapa_chofer.setClickableIcons(false);

            var imageUser = {
                url: 'img/user.png',
                size: new google.maps.Size(32, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(0, 32)
            };
            new google.maps.Marker({
                position: latLngChofer,
                title: '',
                map: $scope.mapa_chofer,
                icon: imageUser
            });

            $scope.updateMarkerServicio($localStorage.chofer.id);


        })
        .controller('ViajesCtrl', function($scope, $ionicHistory) {

//            $sails.get("cliente/viajes")

        })
        .controller('PagosCtrl', function($scope, $ionicHistory) {



        })
        .controller('LogoutCtrl', function($scope, $ionicHistory, AuthService, $state) {

            AuthService.logout().then(function() {
                $state.go('app.login', {});
            });

        })
        .controller('NotificacionesCtrl', function($scope, $ionicHistory) {



        })
        .controller('CancelCtrl', function($scope, $ionicHistory) {

            var razones = [{id: 1, title: ""}]


        })
        .controller('BuscandoCtrl', function($scope, $ionicHistory) {



        })

