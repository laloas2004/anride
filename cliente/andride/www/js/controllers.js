angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $sails) {




            $rootScope.solicitud = {
                origen: {
                    lat: 0,
                    long: 0
                },
                destino: {
                    lat: 0,
                    long: 0
                },
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
        .controller('MapCtrl', function($scope, $rootScope, $sails, $stateParams, $ionicLoading, $http, $cordovaGeolocation, $ionicScrollDelegate, $ionicPlatform, choferService, $q) {

//            console.log($rootScope.solicitud);


            $scope.choferesDisponibles = {};
            $scope.hideBubble = true;
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
                    console.log(position);

                    $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                    $scope.crearChoferesMarkers(position);
                    $ionicLoading.hide();

                    google.maps.event.addListener($scope.map, "center_changed", function() {

                        $scope.MarkerCoordenadas.coordinates = $scope.map.getCenter().toUrlValue();
                        $scope.crearChoferesMarkers({coords: {
                                latitude: $scope.map.getCenter().lat(),
                                longitude: $scope.map.getCenter().lng()
                            }});

                        $scope.$apply();
                    });

//                    
//                    google.maps.event.addListener($scope.map, "center_changed", function() {
//                        
//                       console.log('center_change'); 
//                     $scope.$apply();   
//                    });

                }, function(err) {
                    console.log(err);
                });
            };
            $scope.crearChoferesMarkers = function(position) {

                $scope.MarkerCoordenadas.direccion = "Ir al Marcador";
                $scope.hideBubble = true;
                choferService.getChoferes(position).then(function(response) {

                    $scope.choferesDisponibles = response;
                    $scope.hideBubble = false;
                    var direccion_origen = response.data.matrix.origin_addresses[0].split(',');

                    $scope.MarkerCoordenadas.direccion = direccion_origen[0] + ' Col.' + direccion_origen[1];

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


                });



            };
            $scope.centerOnMe = function() {

                (function() {
                    debugger;
                    $sails.get("/cliente")
                            .success(function(data, status, headers, jwr) {
                                console.log(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                alert('Houston, we got a problem!');
                            });
                })();

                if (!$scope.map) {
                    return;
                }
//    $scope.loading = $ionicLoading.show({
//      content: 'Getting current location...',
//      showBackdrop: false
//    });

                $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));


            };
            $scope.creaSolicitud = function() {

            }
            $scope.onSelectOrigen = function() {
                console.log($scope.MarkerCoordenadas.coordinates);
                if (!$scope.MarkerCoordenadas.coordinates) {
                    alert('no se ha selccionado');
                } else {
                    alert('se selecciona');
                }
            }


        })
        .controller('SideMenuCtrl', function($scope) {

            console.log('SideMenuCtrl');

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

        .controller('DestinoCtrl', function($scope) {



        })

