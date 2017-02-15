angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {


            $rootScope.solicitud = {
                origen: {},
                destino: {},
                direccion_origen: '',
                direccion_destino: 'SE REQUIERE UN DESTINO'
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
                $ionicPopup) {

            $ionicNavBarDelegate.showBackButton(false);

            $scope.choferesDisponibles = {};
            $scope.hideBubble = true;
            $scope.hDestino = true;
            $scope.hBtnPedir = true;
            $scope.hCostoEstimado = true;
            $scope.MarkerCoordenadas = {
                coordinates: null,
                direccion: null,
                tiempoLlegada: null
            };


            $scope.mapCreated = function(map) {


                $scope.map = map;

                $scope.loading = $ionicLoading.show({
                    content: 'Obteniendo tu Ubicacion...',
                    showBackdrop: false
                });

                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

                    $scope.position = position;

                    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                    $scope.crearChoferesMarkers(position);
                    $ionicLoading.hide();

                    google.maps.event.addListener($scope.map, "center_changed", function() {

//                        $scope.MarkerCoordenadas.coordinates = $scope.map.getCenter().toUrlValue();

                        $scope.hDestino = true;
                        $scope.crearChoferesMarkers({coords: {
                                latitude: $scope.map.getCenter().lat(),
                                longitude: $scope.map.getCenter().lng()
                            }});

//                        $scope.$apply();
                    });



                }, function(err) {
                    console.log(err);
                });


                debugger;
            };

            $scope.crearChoferesMarkers = function(position) {

                $rootScope.solicitud.direccion_origen = "Ir al Marcador";
                $scope.MarkerCoordenadas.coordinates = position;
                $scope.hideBubble = true;

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
//                        if (response.data.matrix.origin_addresses[0]) {
//                            
//                        } else {
//                            var direccion_origen = response.data.matrix.origin_addresses[0].split(',');
//                        }
//
//
//                        $rootScope.solicitud.direccion_origen = direccion_origen[0] + ' Col.' + direccion_origen[1];

                        var tiempo = Math.round((response.data.matrix.rows[0].elements[0].duration.value + response.data.matrix.rows[0].elements[0].duration_in_traffic.value) / 60)

                        $scope.MarkerCoordenadas.tiempoLlegada = tiempo + 'Mins';
                        var image = {
                            url: 'img/car-icon.png',
                            size: new google.maps.Size(32, 32),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(0, 32)
                        };

                        angular.forEach(response.data.choferes, function(chofer, index) {
                            console.log('chofer');
                            console.log(chofer);
                            var myLatlng = new google.maps.LatLng(chofer.lat, chofer.lon);

                            var marker = new google.maps.Marker({
                                position: myLatlng,
                                title: chofer.nombre,
                                map: $scope.map,
                                icon: image
                            });



                        });

                    }

                });

                if ($rootScope.seleccionoDestino) {

                    $scope.hideBubble = true;
                    $scope.hDestino = false;
                    $scope.hBtnPedir = false;
                    $scope.hCostoEstimado = false;

                }

            };

            $scope.centerOnMe = function() {

                if (!$scope.map) {
                    return;
                }

                $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));


            };
//            $scope.creaSolicitud = function() {
//
//            }
            $scope.onSelectOrigen = function() {
                $scope.hBtnPedir = true;
                console.log($scope.MarkerCoordenadas.coordinates);

                $rootScope.solicitud.origen = $scope.MarkerCoordenadas.coordinates;

                if (!$scope.MarkerCoordenadas.coordinates) {

                    var alertPopup = $ionicPopup.alert({
                        title: 'No se eligio origen del viaje!',
                        template: 'Por Favor elige un origen para el viaje.'
                    });
//                    alert('no se ha selccionado');
                } else {

                    $scope.hideBubble = true;
                    $scope.hDestino = false;

                }
            }
            $scope.searchOrigen = function() {

                $state.go('app.origen');
            }
            $scope.searchDestino = function() {
                $state.go('app.destino');
            }
            $scope.crearsolicitud = function() {
                $state.go('app.confirmacion');
            }

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
                    name: 'viajes',
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

            $ionicNavBarDelegate.showBackButton(true);

            $ionicSideMenuDelegate.canDragContent(false);

            $scope.backButton = function() {
                $ionicHistory.goBack();
            };
            $scope.onSearchChange = function() {


                clienteService.searchDireccion($scope.busqueda).then(function(response) {
                    $scope.response = response;
                });


            }

            $scope.onSelectItemDestino = function(res) {

                clienteService.getDistancia().then(function(response) {
                    debugger;
                });


                $rootScope.solicitud.destino = {coords: {
                        latitude: res.geometry.location.lat(),
                        longitude: res.geometry.location.lng()
                    }}

                $rootScope.solicitud.direccion_destino = res.formatted_address;
                $rootScope.seleccionoDestino = true;
                $state.go('app.map', {regresoDestino: true});
            }

        })
        .controller('ConfirmaCtrl', function($scope, $ionicHistory) {



        })
        .controller('ViajesCtrl', function($scope, $ionicHistory) {



        })

        .controller('PagosCtrl', function($scope, $ionicHistory) {



        })