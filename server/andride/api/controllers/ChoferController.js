/**
 * ChoferController
 *
 * @description :: Server-side logic for managing chofers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Q = require('q');

module.exports = {
    
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
            return res.json(401, {err: 'Email y Password son requeridos.'});
        }

        Chofer.findOne({email: req_email}).exec(function(err, chofer) {



            if (!chofer) {
                return res.json(401, {err: 'Usuario o contraseña Invalidos.'});

            }

            if (chofer.online) {

                return res.json(401, {err: 'El Usuario esta en Uso.'});
            }

            Chofer.comparePassword(req_password, chofer, function(err, valid) {

                if (err) {
                    return res.json(403, {err: 'Acceso Restringido'});
                }

                if (!valid) {
                    return res.json(401, {err: 'Usuario o contraseña Invalidos.'});
                } else {
                    console.log('-- Login Chofer | ' + chofer.email);
                    delete chofer.password;

                    res.json({
                        chofer: chofer,
                        token: jwToken.issue({id: chofer.id})
                    });

                }

            })
        });

    },
    logout: function(req, res) {

        var choferId = req.session.choferId;

        if (choferId) {
            Chofer.update({id: choferId}, {online: false, status: 'inactivo'}).exec(function(err, chofer) {
                req.session.destroy();
                req.session = null;
                res.json({chofer: chofer[0], logout: true});

            });

        } else {
            res.json({logout: false});
        }

    },
    suscribe: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }
        var socketId = sails.sockets.getId(req);

        var choferId = req.param('choferId');

        if (!choferId) {

            console.log('ChoferController:92 | Falta parammetro choferId');

        }

        sails.sockets.join(req, 'chofer_' + choferId, function(err) {

            if (err) {

                return res.serverError(err);
            }


            Chofer.update({id: choferId}, {socketId: socketId, online: true}).exec(function(err, chofer) {

                if (err) {

                    return res.json({suscrito: false});
                }

                sails.sockets.blast('chofer_online', chofer, req);

                req.session.choferId = choferId;

                sails.log('Suscribe Chofer: ' + choferId + ' -- ' + chofer.email);

                Queue.findOne({idOrigen: {"$in": [choferId]}, entregado: false}).exec(function(err, msg) {

                    if (err) {

                        return res.serverError(err);
                    }

                    if (msg) {

                        sails.sockets.broadcast(msg.tipo + '_' + msg.idDestino[0], msg.event, msg);

                    }

                    return res.json({suscrito: true, socketId: socketId,chofer:chofer[0]});

                });



            });
        });


    },
    signup: function(req, res) {

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
                        console.log('ChoferController:142' + err);
                        return res.json({updated: false});
                    }


                    console.log('--- Se actualizo posicion de: ---');
                    console.log(updated);

                    try {
                        Chofer.publishUpdate(updated[0].id, {chofer: updated[0]});
                    } catch (e) {
                        console.log('ChoferController:152' + e);
                    }

                    return res.json({updated: true});
                })

    },
    validateToken: function(req, res) {

        var token = req.param('token');

        jwToken.verify(token, function(err, token) {

            if (err) {
                console.log('ChoferController:168' + err);
                return res.json({valid: false});
            }

//    req.token = token; // This is the decrypted token or the payload you provided

            return res.json({valid: true});
        });
    },
    servicio: function(req, res) {

        var that = this;

        if (!req.isSocket) {

            return res.badRequest();
        }
        var solicitud = req.param('solicitud');
        
        if(!solicitud){
            console.error('Solicitud es obligatoria');
            return res.serverError('El parametro de Solicitud es obligatoria');
        }

        var chofer = req.session.choferId;


        Solicitud.update({id: solicitud.id}, {
            status: 'aceptada'

        }).exec(function(err, solicitud) {


            if (err) {
                return res.json({err: err});
            }

            Solicitud.publishUpdate(solicitud[0].id, {status: 'aceptada', solicitud: solicitud[0]}, req);


            Cliente.findOne({id: solicitud[0].cliente}).exec(function(err, cliente) {



                Servicio.create({
                    cliente: solicitud[0].cliente,
                    chofer: chofer,
                    solicitud: solicitud[0].id
                }).exec(function(err, servicio) {

                    if (err) {
                        return res.json({err: err});
                    }
                    Servicio.subscribe(req, servicio.id);
                    Servicio.publishCreate(servicio, req);

                    Chofer.update({id: chofer}, {status: 'enservicio'}).exec(function(err, chofer) {

                        if (err) {
                            return res.json({err: err});
                        }
                        Solicitud.findOne({id: servicio.solicitud}).exec(function(err, solicitud) {

                            if (err) {
                                return res.json({err: err});
                            }

                            that._addQueueMsg('cliente', chofer[0].id, cliente.id, 'servicio.iniciada', {solicitud: solicitud, servicio: servicio, chofer: chofer[0]}).then(function(response) {

                                return res.json({err:false,servicio: servicio, cliente: cliente});

                            },function(err){
                                
                               return res.json({err: err, servicio: servicio, cliente: cliente}); 
                                
                            });
//                            sails.sockets.broadcast('cliente_' + cliente.id, 'servicio.iniciada', { solicitud:solicitud,servicio:servicio, chofer:chofer[0]});


                        })

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

        if (!servicio) {
            console.log('Falta parametro de servicio : Linea 256');
        }

        Chofer.findOne({id: servicio.chofer}).exec(function(err, chofer) {

            if (err) {
                console.log('ChoferController:262' + err);
                return res.json({err: err});
            }
            Cliente.findOne({id: servicio.cliente}).exec(function(err, cliente) {
                if (err) {
                    return res.json({err: err});
                }
                sails.sockets.broadcast('cliente_' + cliente.id, 'servicio.onplace', {servicio: servicio, chofer: chofer});
                return res.json({enviado: true});
            })


        })


    },
    empiezaViaje: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var that = this;
        var servicio = req.param('servicio');
        var inicio_viaje_app = req.param('inicio_viaje_app');
        var inicio_viaje = req.param('inicio_viaje');

        Servicio.update({id: servicio.id}, {
            status: 'enproceso',
            inicio_viaje: inicio_viaje.posicion,
            inicio_fecha: inicio_viaje.fechaHora}).exec(function(err, result) {

            if (err) {
                return res.json({err: err});
            }


            that._addQueueMsg('cliente', req.session.choferId, servicio.cliente, 'servicio.inicioViaje', {servicio: servicio}).then(function(response) {
                
                return res.json({err: false, servicio: result, msg:response});

            },function(err,response){
               
               return res.json({err: err, servicio: result, msg:response});
               
            })
                    
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

                        sails.sockets.broadcast('cliente_' + cliente.id, 'servicio.finalizado', {servicio: servicio, totales: result});

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
        var location1 = {};
        var location2 = {};
        try {
            location1 = {
                lat: servicio.inicio_viaje.lat,
                lon: servicio.inicio_viaje.lon
            };
        } catch (e) {

            console.log("Location 1:" + e);

        }
        try {
            location2 = {
                lat: servicio.fin_viaje.lat,
                lon: servicio.fin_viaje.lon
            };
        } catch (e) {

            console.log("Location 2:" + e);

        }


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
    getServicio: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');


        Servicio.findOne({id: servicioId}).exec(function(err, servicio) {

            res.ok(servicio);

        })

    },
    cancelarServicio: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');
        var that = this;

        Servicio.update({id: servicioId}, {status: 'cancelada', cancelo: 'chofer'}).exec(function(err, serv) {

            if (err) {

                return res.json({err: err});
            }

            Servicio.publishUpdate(serv[0].id, {servicio: serv[0]}, req);

            Cliente.findOne({id: serv[0].cliente}).exec(function(err, cliente) {

                if (err) {
                    return res.json({err: err});
                }
                
                that._addQueueMsg('cliente', req.session.choferId, cliente.id, 'servicio.cancelado', {servicio: serv[0]}).then(function(response){
                    
                    
                },function(err){
                    
                 console.log(err);
                    
                });
//                sails.sockets.broadcast(cliente.socketId, 'servicio.cancelado', {servicio: serv[0]});

                Chofer.update({id: req.session.choferId}, {status: 'activo'}).exec(function(err, chofer) {
                    if (err) {
                        return res.json({err: err});
                    }
                    res.ok(serv[0]);
                })



            })

        })


    },
    getServicioPendiente: function(req, res) {


        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.param('ChoferId');

        Servicio.find({
            chofer: choferId,
            status: {'!': ['finalizado', 'cancelada']}
        }).sort('updateAt ASC').exec(function(err, servi) {

            if (err) {
                return res.json({err: err});
            }
            if (servi.length > 0) {
                Servicio.subscribe(req, servi[0].id);
            }

            res.json(servi);

        })

    },
    getSolicitud: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var SolId = req.param('SolId');

        Solicitud.findOne({id: SolId}).exec(function(err, solicitud) {

            if (err) {
                return res.json({err: err});
            }


            res.json(solicitud);

        })
    },
    trackRecorridoServicio: function(req, res) {

        var servicio = req.param('ServId');
        var lat = req.param('lat');
        var lon = req.param('lon');


        Servicio.findOne({id: servicio}).exec(function(err, servicio) {

            var points = servicio.recorridoChofer ? servicio.recorridoChofer : [];

            points.push({lat: lat, lon: lon, date: new Date()});

            Servicio.update({id: servicio}, {recorridoChofer: points}).exec(function(err, servicio) {

                if (err) {
                    return res.json({err: err});
                }

                res.ok(servicio);

            })


        })

    },
    _addQueueMsg: function(tipo, idOrigen, idDestino, evento, data) {

        var deferred = Q.defer();
            intentos = 0;

        if (tipo != 'cliente') {
            console.log('Error debe de ser chofer o cliente');
        }

        if (!idOrigen) {

            console.log('Falta parametro idOrigen');
        }
        if (!idDestino) {

            console.log('Falta parametro idDestino');
        }

        Queue.create({tipo: tipo, event: evento, idOrigen: idOrigen, idDestino: idDestino, data: data}).exec(function(err, msg) {

            if (err) {
                deferred.reject(new Error(err));
            }

            
            sails.sockets.broadcast(msg.tipo + '_' + msg.idDestino[0], msg.event, msg);

            intentos++;

            var interval = setInterval(function(msg) {
                

                Queue.findOne({id: msg.id}).exec(function(err, msg) {

                    if (err) {
                        deferred.reject(new Error(err));
                    }
                    

                    if (!msg.entregado) {

                        sails.sockets.broadcast(msg.tipo + '_' + msg.idDestino[0], msg.event, msg);
                        
                        
                        if (intentos == 5) {

                            deferred.reject('msg_no_entregado',msg);
                            
                            clearInterval(interval);

                            Queue.update({id: msg.id}, {intentos: intentos}).exec(function() {

                            });

                        }
                        
                    } else {
                        deferred.resolve(msg);
                        clearInterval(interval);

                        Queue.update({id: msg.id}, {intentos: intentos}).exec(function() {

                        });

                    }

                })
                
                
            intentos++;    
            }, 4000, msg);


        });

        return deferred.promise;
    },
    getChofer: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.session.choferId;


        Chofer.findOne({id: choferId}).exec(function(err, chofer) {

            if (err) {
                return res.json({err: err});
            }

            res.json(chofer);

        })


    }



};  