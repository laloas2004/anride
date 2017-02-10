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
                $ionicPlatform,
                clienteService,
                choferService,
                $q,
                $ionicPopup) {


            $scope.choferesDisponibles = {};
            $scope.hideBubble = true;
            $scope.hDestino = true;

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

                console.log($scope.MarkerCoordenadas.coordinates);

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

        })
        .controller('SideMenuCtrl', function($scope) {



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
                }, {
                    id: 3,
                    name: 'Notificaciones',
                    level: 0,
                    icon: '',
                    state: 'app.notificaciones'
                }, {
                    id: 4,
                    name: 'Destinos Guardados',
                    level: 0,
                    icon: '',
                    state: 'app.destinos'
                },
                {
                    id: 4,
                    name: 'Mi Cuenta',
                    level: 0,
                    icon: '',
                    state: 'app.micuenta'
                },
                {
                    id: 5,
                    name: 'Ayuda',
                    level: 0,
                    icon: '',
                    state: 'app.ayuda'
                }

            ];

        })

        .controller('OrigenCtrl', function($scope) {

            alert("Origen Controller");

        })
        .controller('DestinoCtrl', function($scope) {

            alert("Destino Controller");

        })

