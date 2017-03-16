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
                    $sails.post("/choferes/suscribe", {choferId: $localStorage.chofer.id})
                            .success(function(data, status, headers, jwr) {

                                $localStorage.socketId = data.socketId;
                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                q.reject(jwr);

                            });
                    return q.promise;
                }

            }


        })
        .factory('choferService', function($http, $q, $sails, $rootScope, $localStorage) {

            return {
                updatePosition: function(location) {

                    var q = $q.defer();

                    var data = {
                        lat: location.latitude,
                        lon: location.longitude,
                        email: $localStorage.chofer.email
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
                }

            }




        })
        .factory('solicitudService', function($http, $q, $sails, $rootScope, $localStorage) {

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

                    var chofer = $localStorage.chofer.id;

                    $sails.get("/choferes/solicitud/pendiente", {ChoferId: chofer})
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
                iniciaViaje: function(servicio,inicio_viaje) {
                    
                    var q = $q.defer();
                    
                                    $sails.post("/choferes/servicio/inicio", {servicio:servicio, inicio_viaje:inicio_viaje})

                                            .success(function(data, status, headers, jwr) {
                                                
                                                debugger;
                                                q.resolve(data);


                                            })
                                            .error(function(data, status, headers, jwr) {
                                                debugger;
                                                q.reject(data);
                                                console.error('Error:' + data);
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
        .factory('dbService', function($http, $q, $sails, $rootScope, $cordovaSQLite, $localStorage) {

            db = $cordovaSQLite.openDB({name: "anride.db", iosDatabaseLocation: 'default'});

            return {
                setInicioViaje: function(inicio_viaje) {

//  $cordovaSQLite.execute(db, 'DROP TABLE inicioViajes;');


                    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS inicioViajes (id INTEGER PRIMARY KEY AUTOINCREMENT,idServicio TEXT, inicio_viaje TEXT, entregado NUMERIC)');

                    var q = $q.defer();

                    var idServicio = $localStorage.servicio.id;

                    var viaje = JSON.stringify(inicio_viaje);

                    var query = "INSERT INTO inicioViajes (idServicio,inicio_viaje, entregado) VALUES (?,?,?)";

                    $cordovaSQLite.execute(db, query, [idServicio, viaje, false]).then(function(res) {

                        q.resolve(res);
                        debugger;
                        console.log("INSERT ID -> " + res.insertId);

                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;

                },
                getInicioViaje: function(idInicioViaje) {

                  var q = $q.defer();

                    var query = "SELECT * FROM inicioViajes WHERE id=" + idInicioViaje;

                    $cordovaSQLite.execute(db, query).then(function(res) {
                        debugger;
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
                        debugger;
                        q.resolve(res);


                    }, function(err) {

                        q.reject(err);
                        console.error(err);
                    });

                    return q.promise;
                },
                trackServicioPoints:function(idServicio,position){
                   
                $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS pointsServicio (id INTEGER PRIMARY KEY AUTOINCREMENT,idServicio TEXT, lat NUMERIC, lon NUMERIC, fecha NUMERIC)');
   
                    
                }


            }


        })