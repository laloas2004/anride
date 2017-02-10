angular.module('app.services', [])
        .factory('loginService', function($http, $q, $sails, $rootScope) {

            return {
                login: function(user) {
                    var q = $q.defer();

                    var config = {
                        url: $rootScope.serverIp + "/cliente/choferes",
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
        .factory('logoutService', function($http, $q, $sails, $rootScope) {

            return {
                getDireccion: function(location) {
                    var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key
                        }
                    };
                    $http(config)
                            .then(function(response) {
                                q.resolve(response);
                            }).catch(function(err) {
                        q.reject(err);

                    });

                    return q.promise;
                },
                searchDireccion: function(texto) {
                      var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key
                        }
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
        .factory('solicitudService', function($http, $q, $sails, $rootScope) {

            return {
                getDireccion: function(location) {
                    var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key
                        }
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
        .factory('servicioService', function($http, $q, $sails, $rootScope) {

            return {
                getDireccion: function(location) {
                    var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key
                        }
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
        .factory('notificationService', function($http, $q, $sails, $rootScope) {

            return {
                getDireccion: function(location) {
                    var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key
                        }
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