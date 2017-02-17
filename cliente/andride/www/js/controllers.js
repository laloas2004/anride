angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, AuthService, $localStorage) {

            $rootScope.seleccionoDestino = false;

            $rootScope.solicitud = {
                origen: {},
                destino: {},
                direccion_origen: 'IR AL MARCADOR',
                direccion_destino: 'SE REQUIERE UN DESTINO',
                matrix: {},
                choferesDisponibles: {},
                tipodePago: {},
                cliente: {},
                status: 'sinenviar',
            };


            $scope.platform = ionic.Platform.platform();
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});
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
                clienteService,
                choferService,
                solicitudService,
                $q,
                $ionicPopup,
                $ionicModal) {
                    
            $sails.on('connect', function(data) {


            });
            $sails.on('disconnect', function(data) {


                alert('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');
            });

            $ionicNavBarDelegate.showBackButton(false);

            $scope.choferesDisponibles = {};
            $scope.DestinoBusqueda = {};
            $scope.OrigenBusqueda = {};
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
            $ionicModal.fromTemplateUrl('templates/buscando_chofer.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal_buscando_chofer = modal;
            });

            $scope.mapCreated = function(map) {

                $scope.map = map;

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
                                $scope.hideBubble = false;
                                $ionicLoading.hide();
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
                });



            };
            $scope.getChoferes = function() {
                var q = $q.defer();
                $scope.choferesDisponibles = {};

                choferService.getChoferes($scope.position).then(function(response) {
                    if (response.data.error) {

                        var alertPopup = $ionicPopup.alert({
                            title: 'Sin servicio en esta area',
                            template: 'No contamos con servicio en esta area, disculpe las molestias.'
                        });
                        q.reject(response.data.error);
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
                    var tiempo = response.data.matrix.rows[0].elements[0].duration.value || 0;
                    var tiempo_trafico = response.data.matrix.rows[0].elements[0].duration_in_traffic.value || 0;

                    var tiempo = Math.round((tiempo + tiempo_trafico) / 60)
                    $scope.MarkerCoordenadas.tiempoLlegada = tiempo + 'Mins';
                } catch (e) {
                    console.log("Error en setLblTiempo: " + e);
                    debugger;
                }

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

                angular.forEach($scope.choferesDisponibles.data.choferes, function(chofer, index) {
                    console.log('chofer');
                    console.log(chofer);

                    var myLatlng = new google.maps.LatLng(chofer.lat, chofer.lon);

                    new google.maps.Marker({
                        position: myLatlng,
                        title: chofer.nombre,
                        map: $scope.map,
                        icon: image
                    });


                });
                q.resolve();

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


//            $scope.getRoutes = function() {
//
//                $scope.loading = $ionicLoading.show({
//                    content: 'Calculando Estimacion...',
//                    showBackdrop: false
//                });
//
//                clienteService.getRouteViaje($rootScope.solicitud).then(function(response) {
//
//                    debugger;
//
//                });
//
//
//
//            }
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

                    $scope.calcularEstimado().then(function(response) {

                        $ionicLoading.hide();
                        $scope.hidePanels('destino', function() {

                            $scope.modal_punto_destino.hide();
                            $scope.solicitud.choferesDisponibles = $scope.choferesDisponibles.data;
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
//                    $scope.modal_buscando_chofer.show();
                    solicitudService.sendSolicitud(solicitud).then(function(response) {
                        
                        $scope.modal_buscando_chofer.hide();
                        
                        alert('recibio solicitud');
                    })

                }


            }



            $scope.$on('$ionicView.beforeEnter', function(event, data) {


//                alert('beforeEnter');
            })


            $scope.$on('$ionicView.afterEnter', function(event, data) {


//                alert('selecciones');
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
                }

            ];

            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };

        })

        .controller('LoginCtrl', function($scope, $rootScope, $localStorage, $ionicSideMenuDelegate, $ionicPlatform, AuthService, $state) {

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

                    $rootScope.solicitud.cliente = response;
                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe().then(function(response) {
                        $state.go('app.map', {});
                    }, function() {

                    });


                }, function() {

                })

            };

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
        .controller('ConfirmaCtrl', function($scope, $ionicHistory) {



        })
        .controller('ViajesCtrl', function($scope, $ionicHistory) {



        })

        .controller('PagosCtrl', function($scope, $ionicHistory) {



        })