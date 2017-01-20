angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

            console.log('AppCtrl');
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



            $scope.choferesDisponibles = {};

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

                choferService.getChoferes(position).then(function(response) {
                    $scope.choferesDisponibles = response;
                    $scope.MarkerCoordenadas.direccion = response.data.matrix.origin_addresses[0];

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
                if (!$scope.map) {
                    return;
                }
//    $scope.loading = $ionicLoading.show({
//      content: 'Getting current location...',
//      showBackdrop: false
//    });

                $scope.map.setCenter(new google.maps.LatLng($scope.position.coords.latitude, $scope.position.coords.longitude));


            };



        })
        .controller('SideMenuCtrl', function($scope) {

            console.log('SideMenuCtrl');

            $scope.theme = 'ionic-sidemenu-dark';
            $scope.tree1 = [];
            $scope.tree = [{
                    id: 1,
                    name: 'Inicio',
                    icon: "ion-pin",
                    level: 0,
                    state: 'app.map'
                }];

        })

