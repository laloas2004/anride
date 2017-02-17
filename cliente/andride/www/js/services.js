angular.module('app.services', [])
        .factory('choferService', function($http, $q, $sails, $rootScope) {

            return {
                getChoferes: function(location) {
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
        .factory('clienteService', function($http, $q, $sails, $rootScope) {

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
                searchDireccion: function(texto, position) {

                    var q = $q.defer();


                    var autocompleteService = new google.maps.places.AutocompleteService();

                    var paisCode = 'MX';

                    var location = new google.maps.LatLng(position.latitude, position.longitude);

                    autocompleteService.getPlacePredictions({
                        input: texto,
                        componentRestrictions: paisCode ? {country: paisCode} : undefined,
                        location: location,
                        radius: '10000',
                    }, function(result, status) {

                        if (status == google.maps.places.PlacesServiceStatus.OK) {

//                            console.log(result);

                            q.resolve(result);
                        }
                        else
                            q.reject(status);
                    });


                    return q.promise;
                },
                getDireccionDetails: function(place) {


                    var detailsService = new google.maps.places.PlacesService(document.createElement("input"));

                    var q = $q.defer();

                    detailsService.getDetails({placeId: place.place_id},
                    function(result, status) {

                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            q.resolve(result);

                        }



                    });

                    return q.promise;

                },
                getRouteViaje: function(solicitud) {
                    var q = $q.defer();
                    var directionsService = new google.maps.DirectionsService();

                    var origen = solicitud.origen.coords.latitude + ',' + solicitud.origen.coords.longitude;
                    var destino = solicitud.destino.coords.latitude + ',' + solicitud.destino.coords.longitude;
                    var request = {
                        origin: origen,
                        destination: destino,
                        travelMode: google.maps.TravelMode.DRIVING,
                        provideRouteAlternatives: true
                    };

                    directionsService.route(request, function(response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {

                            q.resolve(response);
//                            directionsDisplay.setDirections(response);
                        } else {
                            q.reject(status);
                        }
                    });

                    return q.promise;

                },
                getDistancia: function(solicitud) {

                    var q = $q.defer();


                    var origen = solicitud.origen.coords.latitude + ',' + solicitud.origen.coords.longitude;
                    var destino = solicitud.destino.coords.latitude + ',' + solicitud.destino.coords.longitude;

                    var config = {
                        url: "https://maps.googleapis.com/maps/api/distancematrix/json?",
                        method: "GET",
                        params: {
                            origins: origen,
                            destinations: destino,
                            mode: 'driving',
//                        traffic_model: 'pessimistic',
//                        departure_time: 'now',
                            units: 'metric'


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
                },
                getEstimacionMonto: function(solicitud, distancia, tiempo) {
                    var q = $q.defer();

                    var config = {
                        url: $rootScope.serverIp + "/monto/estimado",
                        method: "POST",
                        params: {
                            distancia: distancia,
                            tiempo: tiempo,
//                            solicitud: solicitud
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
                sendSolicitud: function(solicitud) {
                    var q = $q.defer();


                    var config = {
                        url: "https://maps.googleapis.com/maps/api/geocode/json?",
                        method: "GET",
                        params: {
                            latlng: location.coords.latitude + ',' + location.coords.longitude,
                            key: $rootScope.google_key,
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
        .factory('AuthService', function($http, $q, $sails, $rootScope, $localStorage, $sessionStorage) {
            return {
                isAuthenticated: function() {
                    var q = $q.defer();

                    if ($localStorage.token !== null && $localStorage.token !== "") {

                        var config = {
                            url: $rootScope.serverIp + "/cliente/validate",
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
                    var data = {
                        choferId: $localStorage.chofer.id
                    };
                    $sails.post("/choferes/suscribe", data)
                            .success(function(data, status, headers, jwr) {

                                $localStorage.socketId = data.socketId;
                                q.resolve();
                            })
                            .error(function(data, status, headers, jwr) {
                                q.reject(jwr);

                            });
                    return q.promise;
                }

            }


        })