angular.module('app.services', [])
        .factory('choferService', function($http, $q, $sails, $rootScope) {

            return {
                getChoferes: function(location) {

                    var q = $q.defer();

                    var data = {lat: location.coords.latitude, lon: location.coords.longitude};

                    $sails.get("/cliente/choferes", data)
                            .success(function(data, status, headers, jwr) {

                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                q.reject(jwr);

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

                            q.resolve(result);
                        }
                        else{
                            
                            q.reject(status);
                        }
                            
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

                        }else{
                            
                          q.reject(status);  
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
                    
                    debugger;

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
                getEstimacionMonto: function(distancia, tiempo) {
                    
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

                },
                saveDestinoFrecuente:function(destino){
                    
                    if(!destino){
                        
                        console.log('Falta parametro destino en saveDestinoFrecuente');
                    }
                    
                    var q = $q.defer();
                    
                    $sails.post("/clientes/destino/frecuente", { destino: destino })
                    
                            .success(function(data, status, headers, jwr) {
                               
                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                
                                q.reject(jwr);

                            });
                            
                            
                    return q.promise;
                    
                   
                },
         
                getDestinoFrecuentes:function(){
                   
                    var q = $q.defer();
                    
                    $sails.get("/clientes/destino/frecuente", { })
                    
                            .success(function(data, status, headers, jwr) {
                               
                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                
                                q.reject(jwr);

                            }); 
                    
                return q.promise;    
                }

            }




        })
        .factory('solicitudService', function($http, $q, $sails, $rootScope, $localStorage) {
            
            var q = $q.defer();

            return {
                
                solicitud:function(){
                    
                  return {
                            origen: {},
                            destino: {},
                            direccion_origen: 'IR AL MARCADOR',
                            direccion_destino: 'SE REQUIERE UN DESTINO',
                            matrix: {},
                            choferesDisponibles: {},
                            tipodePago: 'efectivo',
                            cliente: {},
                            status: 'iniciada',
                            viajeEnProceso:false,
                            setOrigen:function(origen){

                                this.origen;
                            },
                            getOrigen:function(){

                                return this.origen;
                            },
                            setDestino:function(destino){
                                
                                this.destino = destino;
                            }
 
                  };
                      
                },
                
                sendSolicitud: function(solicitud) {

                    var q = $q.defer();
                    
                    var origen = {};
                    origen.coords= {};
                    origen.coords.latitude = solicitud.origen.coords.latitude;
                    origen.coords.longitude = solicitud.origen.coords.longitude;
                    
                    $sails.post("/clientes/solicitud", {solicitud: solicitud, origen:origen})
                    
                            .success(function(data, status, headers, jwr) {
                               
                                q.resolve(data);
                            })
                            .error(function(data, status, headers, jwr) {
                                
                                q.reject(jwr);

                            });
                            
                            
                    return q.promise;
                }

            }


        })
        .factory('servicioService', function($http, $q, $sails, $rootScope, $localStorage,$sessionStorage) {

            return {
             
                getSolicitudPendiente: function() {

                    var q = $q.defer();
                    
                    try{
                        
                       
                        
                    var cliente = $sessionStorage.session.id;

                    $sails.get("/cliente/servicio/pendiente", {clienteId:cliente})
                            .success(function(servicio, status, headers, jwr) {
                                q.resolve(servicio);
                            })
                            .error(function(err) {
                                q.reject(err);
                            });
                            
                    }catch(e){
                        
                       
                        debugger;
                        q.reject(e);
                    
                    }



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

       
                        var config = {
                            url: $rootScope.serverIp + "/clientes/validate",
                            method: "POST",
                            params: {
 
                            }
                        };

                        $http(config)
                                .then(function(response) {
                                    
                                    
                                    if (response.data.valid) {
                                        
                                        q.resolve(response.data);
                                
                                        $sessionStorage.session = response.data.cliente;
                                        
                                
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
                        url: $rootScope.serverIp + "/clientes/login",
                        method: "POST",
                        params: {
                            email: email,
                            password: password
                        }
                    };

                    $http(config)
                            .then(function(response) {
                                
                                $sessionStorage.session = response.data.cliente;

                               // $localStorage.token = response.data.token;
                               // $localStorage.cliente = response.data.cliente;

                                q.resolve(response.data.cliente);

//                                q.resolve(response);

                            }).catch(function(err) {

                        q.reject(err);

                    });

                    return q.promise;

                },
                logout: function() {

                    var q = $q.defer();

                    var config = {
                        url: $rootScope.serverIp + "/clientes/logout",
                        method: "POST",
                        params: {
                           
                        }
                    };
                    
                     $http(config)
                            .success(function(data, status, headers, jwr) {

                                console.log(data);
                        
                                $localStorage.$reset();
                                
                                q.resolve(data);
                            })
                            
                            .error(function(data, status, headers, jwr) {
                                
                                q.reject(jwr);

                            });
                    

                    return q.promise;
                },
                suscribe: function(cliente) {
                    
                    var q = $q.defer();
                    
                    var data = {
                        
                        cliente:cliente
                    };
                    
                    $sails.post("/clientes/suscribe", data)
                            .success(function(data, status, headers, jwr) {

                                console.log(data);
                        
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
                        url: $rootScope.serverIp + "/cliente/registro",
                        method: "POST",
                        params: {
                            usuario: data
                        }
                    }).then(function(response) {

                            $localStorage.token = response.data.token;
                            $sessionStorage.session = response.data.cliente;
                            q.resolve(response.data.cliente);

                            })
                            .catch(function(err) {
                               
                               q.reject(err);

                            })

                    return q.promise;
                                        
                }

            }


        })