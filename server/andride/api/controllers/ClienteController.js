/**
 * ClienteController
 *
 * @description :: Server-side logic for managing clientes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');


module.exports = {
    getChoferes: function(req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }

        var maxDistance = req.param('distance') || 1000;

        var limitChoferes = 10;


        ClientCoordinates = {
            lon: req.param('lon'),
            lat: req.param('lat')
        };

        Chofer.getChoferesCercanos(ClientCoordinates, maxDistance, limitChoferes).then(function(result) {

            var choferesRes = {};
            choferesRes.choferes = result;


            if (result.length == 0) {

                return res.json({error: "No contamos con servicio en esta area"});
            }

            Chofer.subscribe(req, _.pluck(result, '_id'));

            return res.json(choferesRes);

        });
    },
    create: function(req, res) {

        console.log('se ejecuto registrar');

        if (req.isSocket) {



            return res.json(req.socket);

        }

    },
    login: function(req, res) {

        var req_email = req.param('email');
        var req_password = req.param('password');

        if (!req_email || !req_password) {
            return res.json(401, {err: 'email and password required'});
        }

        Cliente.findOne({email: req_email}).exec(function(err, cliente) {
            if (!cliente) {
                return res.json(401, {err: 'Usuario o contraseña Invalidos.'});

            }

            Cliente.comparePassword(req_password, cliente, function(err, valid) {

                if (err) {
                    return res.json(403, {err: 'Acceso Restringido'});
                }

                if (!valid) {
                    return res.json(401, {err: 'Usuario o contraseña Invalidos.'});
                } else {

                    delete cliente.password;
//                    if (sails.sockets.getId(req)) {
//
//                        var socketId = sails.sockets.getId(req);
//
//                        Chofer.update({id: chofer.id}, {socketId: socketId}).exec(function() {
//                            console.log('Se Actualizo el SocketId de ' + chofer.emial);
//                        })
//                    }

                    res.json({
                        cliente: cliente,
                        token: jwToken.issue({id: cliente.id})
                    });

                }

            })
        })

    },
    logout: function(req, res) {

        console.log('se ejecuto registrar');

        if (req.isSocket) {



            return res.json(req.socket);

        }

    },
    validateToken: function(req, res) {
        var token = req.param('token');
        jwToken.verify(token, function(err, token) {
            if (err)
                return res.json({valid: false});

//    req.token = token; // This is the decrypted token or the payload you provided

            return res.json({valid: true});
        });
    },
    suscribe: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }
        var socketId = sails.sockets.getId(req);
        var clienteId = req.param('clienteId');
//        console.log(req.allParams());

        sails.log('My socket ID is Cliente : ' + socketId);

        sails.sockets.join(req, 'cliente_' + clienteId, function(err) {

            if (err) {
                return res.serverError(err);
            }

            Cliente.update({id: clienteId}, {socketId: socketId, online: true}).exec(function(err, clientesUpdate) {
                if (err) {
                    return res.json({suscrito: false});
                }


                req.session.clienteId = clienteId;

                return res.json({suscrito: true, socketId: socketId});

            });
        });




    },
    _enviaSolicitudaChofer: function(tiempo_espera, finn) {

        var deferred = Q.defer()
        var num_chofer = 0;
        var cant_chofer = finn.choferesDisponibles.choferes.length;

        var loop = function(tiempo_espera, finn) {
            var tiempo = 0;

            var solicitud_chofer = finn.choferesDisponibles.choferes[num_chofer];


            Chofer.findOne({id: solicitud_chofer._id}).exec(function(err, chofer) {

                if (chofer.online && chofer.status == 'activo') {


                    var interval = setInterval(function(tiempo_espera, finn) {

                        if (tiempo == 0) {

                            sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda', finn);
                        }
                        sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda.cont', {tiempo: tiempo, tiempo_espera: tiempo_espera});

                        tiempo++;

                        if (tiempo == tiempo_espera) {

                            sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda.vencio');

                            num_chofer++;

                            clearInterval(interval);

                            if (num_chofer < cant_chofer) {

                                Solicitud.findOne({id: finn.id}).exec(function(err, record) {

                                    if (record.status) {

                                        if (record.status == 'creada') {
                                            loop(tiempo_espera, finn);

                                        } else {
                                            deferred.resolve({respuesta: 'aceptada'});
                                        }


                                    } else {
                                        deferred.resolve({respuesta: 'sin_status'});
                                    }

                                })

                            } else if (num_chofer == cant_chofer) {

                                Solicitud.findOne({id: finn.id}).exec(function(err, record) {

                                    if (record.status) {

                                        if (record.status == 'creada') {

                                            deferred.resolve({respuesta: 'sin_disponibilidad'});

                                        } else {
                                            deferred.resolve({respuesta: 'aceptada'});
                                        }
                                    } else {
                                        deferred.resolve({respuesta: 'sin_status'});
                                    }
                                })

                            }
                        }

                    }, 1000, tiempo_espera, finn);

                } else {

                    num_chofer++;

                    if (num_chofer < cant_chofer) {

                        Solicitud.findOne({id: finn.id}).exec(function(err, record) {

                            if (record.status) {

                                if (record.status == 'creada') {

                                    loop(tiempo_espera, finn);

                                } else {
                                    deferred.resolve({respuesta: 'aceptada'});
                                }
                            } else {
                                deferred.resolve({respuesta: 'sin_status'});
                            }
                        })

                    } else if (num_chofer == cant_chofer) {

                        Solicitud.findOne({id: finn.id}).exec(function(err, record) {

                            if (record.status) {

                                if (record.status == 'creada') {

                                    deferred.resolve({respuesta: 'sin_disponibilidad'});

                                } else {
                                    deferred.resolve({respuesta: 'aceptada'});
                                }
                            } else {
                                deferred.resolve({respuesta: 'sin_status'});
                            }
                        })

                    }

                }
            })


        }
        
        loop(tiempo_espera, finn);

        return deferred.promise;
    },
    solicitud: function(req, res) {

        if (!req.isSocket) {
            
            return res.badRequest();
        }

        console.log(req.allParams());

        var solicitud = req.param('solicitud');
        var socketId = sails.sockets.getId(req);
        var that = this;

        var tiempo_espera = 30;


        Solicitud.create({
            origen: solicitud.origen,
            destino: solicitud.destino,
            matrix: solicitud.matrix,
            cliente: solicitud.cliente,
            choferesDisponibles: solicitud.choferesDisponibles,
            direccion_origen: solicitud.direccion_origen,
            direccion_destino: solicitud.direccion_destino,
            tipodePago: solicitud.tipodePago}).exec(function(err, finn) {

            if (err) {
                return res.json({err: err});
            }

            sails.sockets.broadcast(socketId, 'solicitud.creada', finn);

            Solicitud.subscribe(req, finn.id);
            Solicitud.publishCreate( finn , req);

            that._enviaSolicitudaChofer(tiempo_espera, finn).then(function(respuesta) {
                
                return res.json(respuesta);
                
            })

        })

    },
    suscribeChofer: function(req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }

        var choferId = req.param('choferId');


        Chofer.subscribe(req, choferId);


        return res.ok();
        
    },
    
    cancelarServicio:function(req, res){
        
        if (!req.isSocket) {

            return res.badRequest();
        } 
        
        var servicioId = req.param('servicioId');
        
        Servicio.update({id:servicioId},{status:'cancelada',cancelo:'cliente'}).exec(function(err,serv){

            if (err) {
                return res.json({err: err});
            }
            
         
            
            Servicio.publishUpdate(serv[0].id,{servicio:serv[0]}, req);
            
            res.ok(serv[0]);
            
             
        })
        
        
    },
    getViajes:function(req, res){
        
        
    }

};