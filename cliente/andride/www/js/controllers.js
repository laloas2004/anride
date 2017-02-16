angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {

            $rootScope.seleccionoDestino = false;

            $rootScope.solicitud = {
                origen: {},
                destino: {},
                direccion_origen: 'IR AL MARCADOR',
                direccion_destino: 'SE REQUIERE UN DESTINO',
                matrix:{},
                choferesDisponibles:{},
                tipodePago:{}
            };


            $scope.platform = ionic.Platform.platform();
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            // Form data for the login modal
            $scope.loginData = {};

            // Create the login modal that we will use later
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.modal = modal;
            });

            // Triggered in the login modal to close it
            $scope.closeLogin = function() {
                $scope.modal.hide();
            };

            // Open the login modal
            $scope.login = function() {
                $scope.modal.show();
            };

            // Perform the login action when the user submits the login form
            $scope.doLogin = function() {
                console.log('Doing login', $scope.loginData);

                // Simulate a login delay. Remove this and replace with your login
                // code if using a login system
                $timeout(function() {
                    $scope.closeLogin();
                }, 1000);
            };
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
                $q,
                $ionicPopup,
                $ionicModal) {

            $ionicNavBarDelegate.showBackButton(false);

            $scope.choferesDisponibles = {};
            $scope.DestinoBusqueda = {};
            $scope.status = 'inicio';
            $scope.montoEstimado = 0;
            $scope.hidePanels = function(estatus, cb) {

                var d = estatus || 'inicio';

                var call = cb || function() {
                };

                if (d == 'inicio') {

                    $scope.hideBubble = true;
                    $scope.hDestino = true;
                    $scope.hBtnPedir = true;
                    $scope.hCostoEstimado = true;

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

                }

                call();

            }

            $scope.hidePanels($scope.status);

            $scope.MarkerCoordenadas = {
                coordinates: null,
                direccion: null,
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

                $scope.loading = $ionicLoading.show({
                    template: 'Obteniendo tu Ubicacion...',
                    showBackdrop: false
                });

                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

                    $scope.position = position;

                    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));


                    $scope.crearChoferesMarkers(position, function() {

                        console.log('crearChoferesMarkers---->>')
                    });


                    $ionicLoading.hide();

                    google.maps.event.addListener($scope.map, "center_changed", function() {

                        if ($scope.status == 'inicio' || $scope.status == 'origen') {

                            $scope.crearChoferesMarkers({coords:
                                        {
                                            latitude: $scope.map.getCenter().lat(),
                                            longitude: $scope.map.getCenter().lng()
                                        }}, function() {

                                $scope.hidePanels('center_changed');

                                console.log('crearChoferesMarkers--- Event');
                            });

                        }

//                        $scope.$apply();
                    });

                }, function(err) {
                    console.log(err);
                });



            };
            $scope.crearChoferesMarkers = function(position, cb) {

                $scope.MarkerCoordenadas.coordinates = position;

                if ($scope.status == 'inicio') {
                    $scope.hideBubble = true;
                }


                $scope.choferesDisponibles = {};

                clienteService.getDireccion(position).then(function(response) {

                    var calle = response.data.results[0].address_components[1].long_name;
                    var numero = response.data.results[0].address_components[0].long_name;
                    var colonia = response.data.results[0].address_components[2].long_name;

                    $rootScope.solicitud.direccion_origen = calle + ' ' + numero + ' ' + colonia;
                });

                choferService.getChoferes(position).then(function(response) {

                    if (response.data.error) {

                        var alertPopup = $ionicPopup.alert({
                            title: 'Sin servicio en esta area',
                            template: 'No contamos con servicio en esta area, disculpe las molestias.'
                        });

                    } else {


                        $scope.choferesDisponibles = response;

                        $scope.hideBubble = false;

                        var tiempo = Math.round((response.data.matrix.rows[0].elements[0].duration.value + response.data.matrix.rows[0].elements[0].duration_in_traffic.value) / 60)

                        $scope.MarkerCoordenadas.tiempoLlegada = tiempo + 'Mins';

                        var image = {
                            url: 'img/car-icon.png',
                            size: new google.maps.Size(32, 32),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 32)
                        };
//                            $scope.map.clearMarkers();

                        angular.forEach(response.data.choferes, function(chofer, index) {
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

                    }

                    cb();
                });

//                if ($rootScope.seleccionoDestino) {
//  
//                    $scope.getRoutes();
//
//                }

            };
            $scope.centerOnMe = function() {

                if (!$scope.map) {
                    return;
                }

                $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));


            };
            $scope.onSelectOrigen = function() {
                
                $rootScope.solicitud.origen = $scope.MarkerCoordenadas.coordinates;

                if (!$scope.MarkerCoordenadas.coordinates) {

                    var alertPopup = $ionicPopup.alert({
                        title: 'No se eligio origen del viaje!',
                        template: 'Por Favor elige un origen para el viaje.'
                    });
//                    alert('no se ha selccionado');
                } else {
                    $scope.hidePanels('origen');

                }
            }
            $scope.searchOrigen = function() {

                $state.go('app.origen');
            }
            $scope.searchDestino = function() {
                $scope.modal_punto_destino.show();
            }
            $scope.crearsolicitud = function() {
                $state.go('app.confirmacion');
            };

            $scope.getRoutes = function() {

                $scope.loading = $ionicLoading.show({
                    content: 'Calculando Estimacion...',
                    showBackdrop: false
                });

                clienteService.getRouteViaje($rootScope.solicitud).then(function(response) {
                    
                   debugger; 

                });
                
                

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
                    content: 'Calculando Estimacion...',
                    showBackdrop: false
                });
                 $ionicLoading.hide();
                
                clienteService.getDistancia($scope.solicitud).then(function(response) {
                    
                    $rootScope.solicitud.matrix = response;
                    
                    var matrix_tiempo = response.data.rows[0].elements[0].duration.value;
                    var matrix_distancia = response.data.rows[0].elements[0].distance.value;
                    
                    clienteService.getEstimacionMonto($rootScope.solicitud,matrix_distancia,matrix_tiempo).then(function(response){
                        
                        debugger;
                        
                    });
                    
                    
                    q.resolve(response);
                    
                    
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
                       
               
                        $scope.hidePanels('destino', function() {


//                        $scope.getRoutes();
                           // $scope.modal_punto_destino.hide();



                        });

                        });

                   


                })

            };



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

        .controller('OrigenCtrl', function($scope) {


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