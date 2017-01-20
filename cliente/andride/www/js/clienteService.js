angular.module('app.services', [])
        .factory('choferService', function($http, $q, $sails) {

            return {
                getChoferes: function(location) {
                    var q = $q.defer();

                    var config = {
                        url: "http://192.168.15.98:1337/cliente/choferes",
                        method: "GET",
                        params: {lat: location.coords.latitude, lon: location.coords.longitude}
                    };
                    $http(config)
                            .then(function(response) {
                                q.resolve(response);
                            }).catch(function(err) {
                        q.reject(err);

                    });

                    return q.promise;
                }

            }


        })