angular.module('starter.controllers', ['ngSails','ngCordova'])

.controller('MapCtrl', function($scope, $ionicLoading, $http, $cordovaGeolocation) {



  $scope.mapCreated = function(map) {

        var posOptions = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation
    .getCurrentPosition(posOptions)
    .then(function (position) {
      

      console.log(position);

      $scope.position = position;

    }, function(err) {

      console.log(position);

    });

          $scope.map = map;


  };

  $scope.crearMarker=function(){

  };

  $scope.centerOnMe = function () {


            $http.get('http://192.168.15.98:1337/cliente', { })

            .success(function(data, status, headers, config) {


                console.log(data);
            })

                .error(function(data, status, headers, config) {
                  console.log(status, data);
            });





            if (!$scope.map) {
              return;
            }

            $scope.loading = $ionicLoading.show({
              content: 'Getting current location...',
              showBackdrop: false
            });

            navigator.geolocation.getCurrentPosition(function (pos) {
              console.log('Got pos', pos);
              $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
              $scope.loading.hide();
            }, function (error) {
              alert('Unable to get location: ' + error.message);
            });
  };
});
