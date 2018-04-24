angular.module('app.services', [])
        .factory('AuthService', function($http, $q, $sails, $rootScope, $localStorage, $sessionStorage) {
            return {
                isAuthenticated: function() {

                    var q = $q.defer();



                        var config = {
                            url: $rootScope.serverIp + "/choferes/validate",
                            method: "POST",
                            params: {

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


                    return q.promise;
                },
                login: function(email, password) {

                    var q = $q.defer();
                    $localStorage.$reset();

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

                                // $localStorage.token = response.data.token;
                                $sessionStorage.chofer = response.data.chofer;

                                q.resolve(response);

                            }).catch(function(err) {

                        q.reject(err);

                    });

                    return q.promise;

                },
                logout: function() {

                    var q = $q.defer();

                    var config = {
                        url: $rootScope.serverIp + "/choferes/logout",
                        method: "POST",
                        params: {}
                    };

                    $http(config)
                            .then(function(response) {

                                $localStorage.$reset();

                                q.resolve(response);

                            }).catch(function(err) {

                        q.reject(err);

                    });

                    return q.promise;
                },
                suscribe: function(chofer) {

                    var q = $q.defer();
                    $sails.post("/choferes/suscribe", { choferId:chofer.id, chofer:chofer, status:chofer.status})
                            .success(function(data, status, headers, jwr) {

                               // $localStorage.chofer = data.chofer;
                               // $localStorage.socketId = data.socketId;
                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                q.reject(jwr);

                            });
                    return q.promise;
                },
                registro:function(data){

                      var q = $q.defer();

                        $http({
                            url: $rootScope.serverIp + "/chofer/registro",
                            method: "POST",
                            params: {
                                chofer: data
                            }
                        })
                                .then(function(response) {

                                //$localStorage.token = response.data.token;
                                $sessionStorage.chofer = response.data.chofer;
                                q.resolve(response.data.chofer);

                                })
                                .catch(function(err) {

                                   q.reject(err);

                                })

                        return q.promise;


                }

            }


        })
        .factory('choferService', function($http, $q, $sails, $rootScope, $localStorage,$sessionStorage) {

            return {
                updatePosition: function(location) {

                    var q = $q.defer();

                    var data = {
                        lat: location.latitude,
                        lon: location.longitude
                    };

                    $sails.post("/choferes/posicion", data)
                            .success(function(data, status, headers, jwr) {


                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {


                                q.reject(jwr);

                            });

                    return q.promise;

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
                },
                getAutos: function () {

                    var q = $q.defer();

                    $sails.get("/chofer/autos", {})
                            .success(function (autos, status, headers, jwr) {
                                q.resolve(autos);
                            })
                            .error(function (err) {
                                q.reject(err);
                            });

                    return q.promise;

                }

            }




        })
        .factory('solicitudService', function($http, $q, $sails, $rootScope, $localStorage, $sessionStorage) {

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
                getSolicitudPendiente: function() {

                    var q = $q.defer();

                    var chofer = $sessionStorage.chofer.id;

                    $sails.get("/choferes/solicitud/pendiente", { ChoferId:chofer})
                            .success(function(servicio, status, headers, jwr) {
                                q.resolve(servicio);
                            })
                            .error(function(err) {
                                q.reject(err);
                            });

                    return q.promise;
                }

            }


        })
        .factory('servicioService', function($http, $q, $sails, $rootScope) {

            return {
                iniciaViaje: function(servicio, inicio_viaje) {

                    var q = $q.defer();

                    $sails.post("/choferes/servicio/inicio", {servicio: servicio, inicio_viaje: inicio_viaje})

                            .success(function(data, status, headers, jwr) {


                                q.resolve(data);


                            })
                            .error(function(data, status, headers, jwr) {

                                q.reject(data);
                                console.error('Error:' + data);
                            });


                    return q.promise;
                },
                distancia2points: function(lat1, lon1, lat2, lon2) {
                        Number.prototype.toRad = function() {
                            return this * Math.PI / 180;
                        }


                    var q = $q.defer();

                    if (!lat1 || !lon1) {

                        q.reject('Faltan parametros.');
                    }
                    if (!lat2 || !lon2) {

                        q.reject('Faltan parametros.');
                    }

                    lat1 = Number(lat1);
                    lon1 = Number(lon1);
                    lat2 = Number(lat2);
                    lon2 = Number(lon2);

                    var R = 6371; // km
                    var dLat = (lat2 - lat1).toRad();
                    var dLon = (lon2 - lon1).toRad();

                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;

                    q.resolve(d);

                    return q.promise;
                },


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
        .factory('dbService', function($http, $q, $sails, $rootScope, $cordovaSQLite, $localStorage) {

            var db = $cordovaSQLite.openDB({name: "anride.db", iosDatabaseLocation: 'default'});

            return {
                setInicioViaje: function(inicio_viaje) {

//                   $cordovaSQLite.execute(db, 'DROP TABLE inicioViajes;');


                    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS inicioViajes (id INTEGER PRIMARY KEY AUTOINCREMENT,idServicio TEXT, inicio_viaje TEXT, entregado NUMERIC)');

                    var q = $q.defer();

                    var idServicio = $localStorage.servicio.id;

                    var viaje = JSON.stringify(inicio_viaje);

                    var query = "INSERT INTO inicioViajes (idServicio, inicio_viaje, entregado) VALUES (?,?,?)";

                    $cordovaSQLite.execute(db, query, [idServicio, viaje, false]).then(function(res) {

                        q.resolve(res);

                        console.log("INSERT ID -> " + res.insertId);

                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;

                },
                getInicioViaje: function(idInicioViaje) {

                    var q = $q.defer();

                    var query = "SELECT * FROM inicioViajes WHERE id="+idInicioViaje;

                    $cordovaSQLite.execute(db, query).then(function(res) {

                        q.resolve(res);


                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;

                },
                confirmacionInicioViaje: function(idInicioViaje) {

                    var q = $q.defer();

                    var query = "UPDATE inicioViajes SET entregado = 1 WHERE id=" + idInicioViaje;

                    $cordovaSQLite.execute(db, query).then(function(res) {

                        q.resolve(res);


                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;
                },
                trackServicioPoints: function(idServicio, position) {

                    var q = $q.defer();

                    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS pointsServicio (id INTEGER PRIMARY KEY AUTOINCREMENT,idServicio TEXT, lat NUMERIC, lon NUMERIC, fecha NUMERIC)');
                    var fecha = new Date();
                    var query = "INSERT INTO  pointsServicio (idServicio,lat,lon,fecha) VALUES ()";

                    $cordovaSQLite.execute(db, query, [idServicio,position.lat,position.lon,fecha]).then(function(res) {

                        q.resolve(res);


                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;


                },
                getServicioGeoTrack: function(idServicio) {



                },





            }


        })
