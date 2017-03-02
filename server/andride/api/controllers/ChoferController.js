/**
 * ChoferController
 *
 * @description :: Server-side logic for managing chofers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Q = require('q');

module.exports = {
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    create: function(req, res) {


//        if (req.body.password !== req.body.confirmPassword) {
//            return res.json(401, {err: 'Password doesn\'t match, What a shame!'});
//        }

        Chofer.create(req.body).exec(function(err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            if (chofer) {
                res.json(200, {chofer: chofer, token: jwToken.issue({id: chofer.id})});
            }

        });
    },
    login: function(req, res) {

        var req_email = req.param('email');
        var req_password = req.param('password');

        if (!req_email || !req_password) {
            return res.json(401, {err: 'email and password required'});
        }

        Chofer.findOne({email: req_email}).exec(function(err, chofer) {
            if (!chofer) {
                return res.json(401, {err: 'Usuario o contraseña Invalidos.'});

            }

            Chofer.comparePassword(req_password, chofer, function(err, valid) {

                if (err) {
                    return res.json(403, {err: 'Acceso Restringido'});
                }

                if (!valid) {
                    return res.json(401, {err: 'Usuario o contraseña Invalidos.'});
                } else {

                    delete chofer.password;
//                    if (sails.sockets.getId(req)) {
//
//                        var socketId = sails.sockets.getId(req);
//
//                        Chofer.update({id: chofer.id}, {socketId: socketId}).exec(function() {
//                            console.log('Se Actualizo el SocketId de ' + chofer.emial);
//                        })
//                    }

                    res.json({
                        chofer: chofer,
                        token: jwToken.issue({id: chofer.id})
                    });

                }

            })
        });

    },
    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    },
    suscribe: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }
        var socketId = sails.sockets.getId(req);
        var choferId = req.param('choferId');
//        console.log(req.allParams());

        sails.log('My socket ID is: ' + socketId);

        sails.sockets.join(req, 'chofer_' + choferId, function(err) {

            if (err) {
                return res.serverError(err);
            }


            Chofer.update({id: choferId}, {socketId: socketId, online: true}).exec(function(err, chofer) {

                if (err) {

                    return res.json({suscrito: false});
                }


                req.session.choferId = choferId;

                return res.json({suscrito: true, socketId: socketId});

            });
        });


    },
    signup: function(req, res) {

    },
    newChofer: function(req, res) {
    },
    trackChofer: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var socketId = sails.sockets.getId(req);
        var lat = req.param('lat');
        var lon = req.param('lon');
        var email = req.param('email');

        Chofer.update({email: email},
        {lat: lat, lon: lon, location: {type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)]}, socketId: socketId, online: true})

                .exec(function(err, updated) {
                    if (err) {
                        console.log(err);
                        return res.json({updated: false});
                    }


                    console.log('--- Se actualizo posicion de: ---');
                    console.log(updated);

                    try {

                        Chofer.publishUpdate(updated[0].id, {chofer: updated[0]});
                    } catch (e) {
                        console.log(e);
                    }

                    return res.json({updated: true});
                })

    },
    getChoferes: function(req, res) {
    },
    setDisponibilidadChofer: function(req, res) {
    },
    updateStatus: function(req, res) {

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
    servicio: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }
        var solicitud = req.param('solicitud');

        var chofer = req.param('chofer');


        Solicitud.update({id: solicitud.id}, {
            status: 'aceptada'

        }).exec(function(err, solicitud) {


            if (err) {
                return res.json({err: err});
            }

            Solicitud.publishUpdate(solicitud[0].id, {status: 'aceptada', solicitud: solicitud[0]}, req);


            Cliente.findOne({id: solicitud[0].cliente}).exec(function(err, cliente) {

                sails.sockets.broadcast(cliente.socketId, 'solicitud.aceptada', solicitud[0]);

                Servicio.create({
                    cliente: solicitud[0].cliente,
                    chofer: chofer.id,
                    solicitud: solicitud[0].id
                }).exec(function(err, servicio) {

                    if (err) {
                        return res.json({err: err});
                    }

                    Servicio.subscribe(req, servicio.id);
                    Servicio.publishCreate(servicio, req);

                    Chofer.update({id: chofer.id}, {status: 'enservicio'}).exec(function(err, chofer) {

                        if (err) {
                            return res.json({err: err});
                        }

                        sails.sockets.broadcast(cliente.socketId, 'servicio.iniciada', {servicio: servicio, chofer: chofer[0]});

                        sails.sockets.broadcast(chofer[0].id, 'servicio.iniciada', {servicio: servicio});

                        return res.json({servicio: servicio, cliente: cliente});
                    })

                })

            })

        })

    },
    onPlace: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }
        var servicio = req.param('servicio');

        Chofer.findOne({id: servicio.chofer}).exec(function(err, chofer) {
            if (err) {
                return res.json({err: err});
            }
            Cliente.findOne({id: servicio.cliente}).exec(function(err, cliente) {
                if (err) {
                    return res.json({err: err});
                }
                sails.sockets.broadcast(cliente.socketId, 'servicio.onplace', {servicio: servicio, chofer: chofer});
                return res.json({enviado: true});
            })


        })


    },
    empiezaViaje: function(req, res) {
        
        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicio = req.param('servicio');

        var inicio_viaje = req.param('inicio_viaje');

        Servicio.update({id: servicio.id}, {
            status: 'enproceso',
            inicio_viaje: inicio_viaje.posicion,
            inicio_fecha: inicio_viaje.fechaHora}).exec(function(err, result) {

            if (err) {
                return res.json({err: err});
            }

            Cliente.findOne({id: servicio.cliente}).exec(function(err, cliente) {

                if (err) {
                    return res.json({err: err});
                }
                sails.sockets.broadcast(cliente.socketId, 'servicio.inicio', {servicio: servicio});
            })

            return res.json({servicio: result});

        })


    },
    terminaViaje: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }
        var servicio = req.param('servicio');

        var fin_viaje = req.param('fin_viaje');

        var that = this;

        Servicio.update({
            id: servicio.id}, {status: 'finalizado',
            fin_viaje: fin_viaje.posicion,
            fin_fecha: fin_viaje.fechaHora}).exec(function(err, result) {
            if (err) {
                return res.json({err: err});
            }



            that._calcularCobro(result[0]).then(function(respuesta) {

                Servicio.update({
                    id: servicio.id}, {
                    tiempo: respuesta.tiempo,
                    distancia: respuesta.distancia,
                    monto: respuesta.monto
                }).exec(function(err, result) {
                    if (err) {
                        return res.json({err: err});
                    }

                    Cliente.findOne({id: servicio.cliente}).exec(function(err, cliente) {

                        if (err) {
                            return res.json({err: err});
                        }

                        sails.sockets.broadcast(cliente.socketId, 'servicio.finalizado', {servicio: servicio, totales: result});

                    })
                    
                    
                    Chofer.update({id: req.session.choferId}, {status: 'activo'}).exec(function(err, chofer) {
                        if (err) {
                            return res.json({err: err});
                        }
                        
                        
                        return res.json(respuesta);
                        
                    })
                    

                })

            });

        })


    },
    _calcularCobro: function(servicio) {

        var deferred = Q.defer();

        var tarifa_base = 9;
        var tarifakm = 8;
        var tarifaxmin = 3;
        var monto = 0;

        var fecha_inicio = new Date(servicio.inicio_fecha);

        var fecha_fin = new Date(servicio.fin_fecha);

        var segundos = (fecha_fin - fecha_inicio) / 1000;

        var minutos = Math.floor(segundos % 3600) / 60;

        var location1 = {
            lat: servicio.inicio_viaje.lat,
            lon: servicio.inicio_viaje.lon
        };
        var location2 = {
            lat: servicio.fin_viaje.lat,
            lon: servicio.fin_viaje.lon
        };

        GmapService.getMatrix(location1, location2).then(function(val) {

            var distancia = val.rows[0].elements[0].distance.value;

            monto = (tarifakm * distancia) + (tarifaxmin * minutos) + tarifa_base;

            deferred.resolve({tiempo: minutos, distancia: distancia, monto: monto});

        }, function(err) {

            return res.json(err);
        });
//

        return deferred.promise;
    },
    cancelaViaje: function(req, res) {



    },
    canceloCliente: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');

        var fin_viaje = req.param('fin_viaje');

        Servicio.update({id: servicioId}, {fin_viaje: fin_viaje.posicion, fin_fecha: fin_viaje.fechaHora}).exec(function(err, servi) {

            if (err) {
                return res.json({err: err});
            }

            Chofer.update({id: req.session.choferId}, {status: 'activo'}).exec(function(err, chofer) {
                if (err) {
                    return res.json({err: err});
                }
                res.ok(chofer);
            })


        })




    },
    cambiarStatus: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.session.choferId;
        var action = req.param('action');

        Chofer.update({id: choferId}, {status: action}).exec(function(err, chofer) {

            res.ok(chofer[0]);

        })


    },
    
    getServicio: function(req, res){
        
        if (!req.isSocket) {
            return res.badRequest();
        }
        
        var servicioId = req.param('servicioId');
        
        
        Servicio.findOne({id:servicioId}).exec(function(err,servicio){
            
            res.ok(servicio); 
            
        })
        
    },
    cancelarServicio:function(req, res){
        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');


        Servicio.update({id: servicioId}, {status: 'cancelada', cancelo: 'chofer'}).exec(function(err, serv) {

            if (err) {

                return res.json({err: err});
            }

            Servicio.publishUpdate(serv[0].id, {servicio: serv[0]}, req);

            Cliente.findOne({id: serv[0].cliente}).exec(function(err, cliente) {

                if (err) {
                    return res.json({err: err});
                }

                sails.sockets.broadcast(cliente.socketId, 'servicio.cancelado', {servicio: serv[0]});

                Chofer.update({id:req.session.choferId}, {status: 'activo'}).exec(function(err, chofer) {
                    if (err) {
                        return res.json({err: err});
                    }
                    res.ok(serv[0]);
                })



            })

        })


    }



};  