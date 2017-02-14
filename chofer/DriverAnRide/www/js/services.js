angular.module('app.services', [])
        .factory('AuthService', function($http, $q, $sails, $rootScope, $localStorage, $sessionStorage) {
            return {
                isAuthenticated: function() {
                    var q = $q.defer();

                    if ($localStorage.token !== null && $localStorage.token !== "") {

                        var config = {
                            url: $rootScope.serverIp + "/choferes/validate",
                            method: "POST",
                            params: {
                                token: $localStorage.token
                            }
                        };

                        $http(config)
                                .then(function(response) {
                                    if (response.data.valid) {
                                        q.resolve(response);
                                    } else {
                                        q.reject('Token no Valido');
                                    }


                                }).catch(function(err) {
                            q.reject(err);

                        });

                    } else {

                        q.reject('No exite Token de Authenticacion');
                    }

                    return q.promise;
                },
                login: function(email, password) {

                    var q = $q.defer();
                    $localStorage.$reset();
//                    $localStorage = $localStorage.$default({
//                        token: '',
//                        chofer:{}
//                    });

                    var config = {
                        url: $rootScope.serverIp + "/choferes/login",
                        method: "POST",
                        params: {
                            email: email,
                            password: password
                        }
                    };

                    $http(config)
                            .then(function(response) {

                                $localStorage.token = response.data.token;
                                $localStorage.chofer = response.data.chofer;

                                q.resolve(response);

                            }).catch(function(err) {

                        q.reject(err);

                    });

                    return q.promise;

                },
                logout: function() {

                    var q = $q.defer();

                    $localStorage.$reset();
                    q.resolve();
                    return q.promise;
                },
                suscribe: function() {
                    var q = $q.defer();

                    $sails.get("/choferes/suscribe")
                            .success(function(data, status, headers, jwr) {
                                debugger;
                            })
                            .error(function(data, status, headers, jwr) {
                                alert('Houston, we got a problem!');
                            });

                }

            }


        })
        .factory('choferService', function($http, $q, $sails, $rootScope) {

            return {
                updatePosition: function(location) {

                },
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
                    var geocoder = new google.maps.Geocoder();


                    geocoder.geocode({
                        address: texto,
                        region: 'MX'
                    }, function(results, status) {

                        if (status == google.maps.GeocoderStatus.OK) {

                            q.resolve(results);
                        } else {
                            debugger;
                            q.reject();
                        }

                    });


                    return q.promise;
                },
                getDistancia: function(coords1, coords2) {

                    var q = $q.defer();

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/distancematrix/json?",
                        method: "GET",
                        params: {origin: {}, coords2: {}}
                    };
                    $http(config)
                            .then(function(response) {
                                q.resolve(response);
                            }).catch(function(err) {
                        q.reject(err);

                    });

                    return q.promise;
                },
                getConfiguracion: function() {

                    var q = $q.defer();

                    var config = {
                        url: $rootScope.serverIp + "/distancia",
                        method: "GET",
                        params: {coords1: {}, coords2: {}}
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