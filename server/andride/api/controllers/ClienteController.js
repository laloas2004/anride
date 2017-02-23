/**
 * ClienteController
 *
 * @description :: Server-side logic for managing clientes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');


module.exports = {
    getChoferes: function(req, res) {


        var maxDistance = req.param('distance') || 1000;


        ClientCoordinates = {
            lon: req.param('lon'),
            lat: req.param('lat')
        };


        Chofer.getChoferesCercanos(ClientCoordinates).then(function(result) {
            var choferesRes = {};
            choferesRes.choferes = result;
            //console.log(result[0]);
            var location1 = {
                lat: req.param('lat'),
                lon: req.param('lon')
            };


            if (result.length == 0) {

                return res.json({error: "No contamos con servicio en esta area"});
            }


            var location2 = {
                lat: result[0].lat,
                lon: result[0].lon
            }
            console.log(location1);
            console.log(location2);

            GmapService.getMatrix(location1, location2).then(function(val) {
                choferesRes.matrix = val;
                return res.json(choferesRes);
            }, function(err) {
                return res.json(err);
            });
//			return res.json(result);
        }, function(err) {
            console.log('Error: En getChoferes .' + err)
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

        sails.log('My socket ID is: ' + socketId);

        sails.sockets.join(req, 'Clientes', function(err) {
            if (err) {
                return res.serverError(err);
            }

            Cliente.update({id: clienteId}, {socketId: socketId, online: true}).exec(function() {
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

            var chofer = finn.choferesDisponibles.choferes[num_chofer];

            var interval = setInterval(function(tiempo_espera, finn) {

                if (tiempo == 0) {

                    sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda', finn);
                }
                sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda.cont', {tiempo:tiempo,tiempo_espera:tiempo_espera});

                tiempo++;

                if (tiempo == tiempo_espera) {

                    sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda.vencio');
                    num_chofer++;

                    clearInterval(interval);

                    if (num_chofer < cant_chofer) {

                        Solicitud.findOne({id: finn.id}).exec(function(err, record) {
                            
                            if (record.status) {

                                if (record.status == 'confirmada') {
                                    loop(tiempo_espera, finn);

                                } else {
                                    deferred.resolve({respuesta: 'aceptada'});
                                }


                            } else {
                                deferred.resolve({respuesta: 'sin_status'});
                            }

                        })

                    } else {
                        deferred.resolve({respuesta: 'sin_disponibilidad'});
                    }
                }

            }, 1000, tiempo_espera, finn);

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


            sails.sockets.blast(socketId, 'solicitud.confirmada', finn);


            that._enviaSolicitudaChofer(tiempo_espera, finn).then(function(res) {
                console.log(res);


                if (res.respuesta){
                    
                }


            })



//            sails.sockets.blast('solicitud', data);

//            sails.sockets.broadcast('Choferes', 'solicitud', data);

//            return res.json({recibido: true});
        })

//       
//        setTimeout(function() {
//          
//        }, 30000);
//        

    }

};