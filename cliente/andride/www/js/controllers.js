angular.module('starter.controllers', ['ngSails', 'ngCordova'])
        .controller('MapCtrl',
        function($scope, $rootScope, $stateParams, $ionicLoading, $http, $cordovaGeolocation, $ionicScrollDelegate, $ionicPlatform,choferService,$q) {
            $scope.choferesDisponibles = {};
            
            $scope.MarkerCoordenadas = {
                coordinates: null,
                direccion:null,
                tiempoLlegada:null
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
                    $scope.loading.hide();

                    google.maps.event.addListener($scope.map, "center_changed", function() {
                            
                        $scope.MarkerCoordenadas.coordinates = $scope.map.getCenter().toUrlValue();
                        $scope.crearChoferesMarkers({coords:{
                               latitude:$scope.map.getCenter().lat(),
                               longitude:$scope.map.getCenter().lng()
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
                           
                           var tiempo = Math.round((response.data.matrix.rows[0].elements[0].duration.value+response.data.matrix.rows[0].elements[0].duration_in_traffic.value)/60)
                           
                           $scope.MarkerCoordenadas.tiempoLlegada = tiempo +'Mins';
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
                                    map:$scope.map,
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



        });