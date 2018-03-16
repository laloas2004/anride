/**
 * ChoferController
 *
 * @description :: Server-side logic for managing chofers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Q = require('q');

module.exports = {
    create: function (req, res) {


        console.log(req.allParams());

        var chofer = JSON.parse(req.param('chofer'));


        if (!chofer.nombre) {
            return res.json(401, {err: 'nombre required'});
        }

        if (!chofer.apellido) {
            return res.json(401, {err: 'apellido required'});
        }

        if (!chofer.celular) {
            return res.json(401, {err: 'celular required'});
        }
        if (!chofer.email) {
            return res.json(401, {err: 'email required'});
        }
        if (!chofer.password) {
            return res.json(401, {err: 'password required'});
        }

        Chofer.create({
            nombre: chofer.nombre,
            apellido: chofer.apellido,
            email: chofer.email,
            numCel: chofer.celular,
            password: chofer.password
        }).exec(function (err, chofer) {

            if (err) {
                return res.json(403, {err: 'Error al registrar'});
            }

            delete chofer.password;

            res.json({
                chofer: chofer,
                token: jwToken.issue({id: chofer.id})
            });

        });

    },
    login: function (req, res) {

        var req_email = req.param('email');
        var req_password = req.param('password');

        if (!req_email || !req_password) {
            return res.json(401, {err: 'Email y Password son requeridos.'});
        }

        Chofer.findOne({email: req_email}).exec(function (err, chofer) {

            if (!chofer) {
                return res.json(401, {err: 'Usuario o contraseña Invalidos.'});

            }

            if (chofer.online) {
                
                console.log('El Usuario esta en Uso.');
                return res.json(401, {err: 'Usuario ya cuenta con una session activa.'});
            }

            Chofer.comparePassword(req_password, chofer, function (err, valid) {

                if (err) {
                    return res.json(403, {err: 'Acceso Restringido'});
                }

                if (!valid) {
                    
                    return res.json(401, {err: 'Usuario o contraseña Invalidos.'});
                    
                } else {
                    
                    console.log('-- Login Chofer | ' + chofer.email);
                    
                    delete chofer.password;
                    
                    req.session.chofer = chofer;
                    req.session.online = true;
                    
                    res.json({
                        chofer: chofer,
                        token: jwToken.issue({id: chofer.id})
                    });

                }

            })
        });

    },
    logout: function (req, res) {

        var choferId = req.session.chofer.id;

        if (choferId) {
            Chofer.update({id: choferId}, {online: false, status: 'inactivo'}).exec(function (err, chofer) {
//                req.session.destroy();
//                req.session = null;
                res.json({chofer: chofer[0], logout: true});

            });

        } else {
            res.json({logout: false});
        }

    },
    suscribe: function (req, res) {

        if (!req.isSocket) {
            
            return res.badRequest();
        }
        
        
        if(!req.session.chofer){
            
            
           var choferId = req.param('choferId');
           
           if(!choferId){
               
            return res.badRequest('El Chofer no tiene sesion valida.');
               
           }
            

        }else{
            
          var choferId = req.session.chofer.id;
        }
        
        
        var socketId = sails.sockets.getId(req);

        
        
        var status = req.param('status') || 'inactivo';

   
        sails.sockets.join(req, choferId, function (err) {

            if (err) {

                return res.serverError(err);
            }


            Chofer.update({id:choferId}, { socketId:socketId, online: true, status:status } ).exec(function (err, chofer) {

                if (err) {

                    return res.json({suscrito: false});
                }

                sails.sockets.blast('chofer_online', chofer, req);


                sails.log('Suscribe Chofer: ' + choferId + ' -- ' + chofer[0].email);

                Queue.findOne({idOrigen: {"$in": [choferId]}, entregado: false}).exec(function (err, msg){

                    if (err) {

                        return res.serverError(err);
                    }

                    if (msg) {

                        sails.sockets.broadcast(msg.idDestino[0], msg.event, msg);

                    }

                    return res.json({ suscrito: true, socketId: socketId, chofer: chofer[0]});

                });

            });
        });


    },
    signup: function (req, res) {

    },
    trackChofer: function (req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }

        var socketId = sails.sockets.getId(req);
        var lat = req.param('lat');
        var lon = req.param('lon');
        var email = req.param('email');

        Chofer.update({email: email},
        {lat: lat, lon: lon, location: {type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)]}, socketId: socketId, online: true})

                .exec(function (err, updated) {
                    if (err) {
                        console.log('ChoferController:142' + err);
                        return res.json({updated: false});
                    }


//                    console.log('--- Se actualizo posicion de: ---');
//                    console.log(updated);

                    try {
                        
                        Chofer.publishUpdate(updated[0].id, {chofer: updated[0]});
                        
                    } catch (e) {
                        
                        console.log('ChoferController:152' + e);
                    }

                    return res.json({updated: true});
                })

    },
    validateToken: function (req, res) {
        
        if(req.session.chofer){
            
                console.log('sesion valida:'+ req.session.chofer);
                
          return res.json({valid: true, chofer:req.session.chofer});
          
        }else{
            console.log('sesion chofer invalida');
          return res.json({valid: false});  
        }
    },
    servicio: function (req, res) {

        var that = this;

        if (!req.isSocket) {

            return res.badRequest();
        }


        var solicitud = req.param('solicitud');
        var chofer = req.session.chofer.id;

        if (!solicitud) {
            console.error('Solicitud es obligatoria');
            return res.json(401, {err: 'Solicitud es obligatoria'});
        }
        if (!chofer) {
            console.error('Chofer Session no existe');
            return res.json(401, {err: 'Chofer Session no existe'});
        }




        Solicitud.update({id: solicitud.id}, {
            
            status: 'aceptada'

        }).exec(function (err, solicitud) {


            if (err) {

                return res.json({err: err});
            }

            Solicitud.publishUpdate(solicitud[0].id, { status: 'aceptada', solicitud: solicitud[0]}, req);


            Cliente.findOne({id: solicitud[0].cliente}).exec(function (err, cliente) {


                Servicio.create({
                    cliente: solicitud[0].cliente,
                    chofer: chofer,
                    solicitud: solicitud[0].id
                }).exec(function (err, servicio) {

                    if (err) {
                        return res.json({err: err});
                    }
                    Servicio.subscribe(req, servicio.id);
                    Servicio.publishCreate(servicio, req);

                    Chofer.update({id: chofer}, {status: 'enservicio'}).exec(function (err, updated) {


                        Chofer.find({id: updated[0].id}).populate('autoActivo').exec(function (err, chofer) {

                            if (err) {
                                return res.json({err: err});
                            }



                            if (err) {
                                return res.json({err: err});
                            }

                            Solicitud.findOne({id: servicio.solicitud}).exec(function (err, solicitud) {

                                if (err) {
                                    return res.json({err: err});
                                }

                                if (!chofer[0].id) {
                                    return res.json(401, {err: 'falta parametro origen en linea 279.'});
                                }
                                if (!chofer[0].id) {
                                    return res.json(401, {err: 'falta parametro destino en linea 279.'});
                                }


                                try {

                                    console.log('Cliente:');
                                    console.log(cliente);

                                    that._addQueueMsg('cliente', chofer[0].id, cliente.id, 'servicio.iniciada', {solicitud: solicitud, servicio: servicio, chofer: chofer[0]}).then(function (response) {

                                        return res.json({err: false, servicio: servicio, cliente: cliente});

                                    }, function (err) {

                                        return res.json({err: err, servicio: servicio, cliente: cliente});

                                    });

                                } catch (e) {
                                    console.error(e);
                                }
                                
//                            sails.sockets.broadcast('cliente_' + cliente.id, 'servicio.iniciada', { solicitud:solicitud,servicio:servicio, chofer:chofer[0]});


                            })
                        });
                    })

                })

            })

        })

    },
    onPlace: function (req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }
        var servicio = req.param('servicio');

        if (!servicio) {
            console.log('Falta parametro de servicio : Linea 256');
        }

        Chofer.findOne({id: servicio.chofer}).exec(function (err, chofer) {

            if (err) {
                console.log('ChoferController:262' + err);
                return res.json({err: err});
            }
            Cliente.findOne({id: servicio.cliente}).exec(function (err, cliente) {
                if (err) {
                    return res.json({err: err});
                }
                sails.sockets.broadcast(cliente.id, 'servicio.onplace', {servicio: servicio, chofer: chofer});
                return res.json({enviado: true});
            })


        })


    },
    empiezaViaje: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var that = this;
        var servicio = req.param('servicio');
        var inicio_viaje = req.param('inicio_viaje');


        if (!servicio) {
            return res.json(401, {err: 'falta parametro servicio en linea 347.'});
        }
        if (!inicio_viaje) {
            return res.json(401, {err: 'falta parametro inicio_viaje en linea 349.'});
        }

        Servicio.update({id: servicio.id}, {
            status: 'enproceso',
            inicio_viaje: inicio_viaje.posicion,
            inicio_fecha: inicio_viaje.fechaHora}).exec(function (err, result) {

            if (err) {
                return res.json({err: err});
            }


            that._addQueueMsg('cliente', req.session.chofer.id, servicio.cliente, 'servicio.inicioViaje', {servicio: servicio}).then(function (response) {

                return res.json({err: false, servicio: result, msg: response});

            }, function (err, response) {

                return res.json({err: err, servicio: result, msg: response});

            })

        })


    },
    terminaViaje: function (req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }
        var servicio = req.param('servicio');

        var fin_viaje = req.param('fin_viaje');

        var recorrido = req.param('recorrido');

        var distancia = req.param('distancia');


        if (!servicio) {
            
            console.log('Falta parametro servicio terminaViaje');
        }

        if (!fin_viaje) {

            console.log('Falta parametro fin_viaje terminaViaje');

        }

        if (!recorrido) {

            console.log('Falta parametro recorrido terminaViaje');
        }
        console.log(distancia);
        if (!distancia) {
            console.log('Falta parametro distancia terminaViaje');
        }

        var that = this;

        Servicio.update({
            id: servicio.id}, {status: 'finalizado',
            fin_viaje: fin_viaje.posicion,
            fin_fecha: fin_viaje.fechaHora,
            distance: distancia,
            recorridoChofer: recorrido
        }).exec(function (err, result) {

            if (err) {
                return res.json({err: err});
            }



            that._calcularCobro(result[0]).then(function (respuesta) {

                Servicio.update({
                    id: servicio.id}, {
                    tiempo: respuesta.tiempo,
                    monto: respuesta.monto
                }).exec(function (err, result) {
                    if (err) {
                        return res.json({err: err});
                    }

                    Cliente.findOne({id: servicio.cliente}).exec(function (err, cliente) {

                        if (err) {
                            return res.json({err: err});
                        }

                        sails.sockets.broadcast(cliente.id, 'servicio.finalizado', {servicio: servicio, totales: result});

                    })


                    Chofer.update({id: req.session.chofer.id}, {status: 'activo'}).exec(function (err, chofer) {

                        if (err) {
                            return res.json({err: err});
                        }


                        return res.json(respuesta);

                    })


                })

            });

        })


    },
    _calcularCobro: function (servicio) {

        var deferred = Q.defer();

        configTaxiapp.get().then(function (config) {

            console.log(config);

            var distancia_km = 0;
            var monto = 0;
            var tarifa_base = parseFloat(config.tarifa_base);
            var tarifakm = parseFloat(config.tarifa_kilometro);
            var tarifaxmin = parseFloat(config.tarifa_minuto);
            var monto_minimo = parseFloat(config.tarifa_minima);

            var fecha_inicio = new Date(servicio.inicio_fecha);

            var fecha_fin = new Date(servicio.fin_fecha);

            var segundos = (fecha_fin - fecha_inicio) / 1000;

            var minutos = Math.floor(segundos % 3600) / 60;

            try {

                var distancia_km = servicio.distance / 1000;

            } catch (e) {

                console.log(e);
            }

            monto = (tarifakm * distancia_km) + (tarifaxmin * minutos) + tarifa_base;

            if (monto < monto_minimo) {
                monto = monto_minimo;
            }

            deferred.resolve({tiempo: minutos, monto: monto});
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    },
    canceloCliente: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');

        var fin_viaje = req.param('fin_viaje');

        Servicio.update({id: servicioId}, {fin_viaje: fin_viaje.posicion, fin_fecha: fin_viaje.fechaHora}).exec(function (err, servi) {

            if (err) {
                return res.json({err: err});
            }

            Chofer.update({id: req.session.chofer.id}, {status: 'activo'}).exec(function (err, chofer) {
                if (err) {
                    return res.json({err: err});
                }
                res.ok(chofer);
            })


        })




    },
    cambiarStatus: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }
        
        if(!req.session.chofer){
            
            return res.forbidden();
        }

        var choferId = req.session.chofer.id;
        
        var action = req.param('action');

        if (action == 'activo') {

            Chofer.update({id: choferId}, {status: action, online: true}).exec(function (err, chofer) {

                res.ok(chofer[0]);

            })
        } else {

            Chofer.update({id: choferId}, {status: action}).exec(function (err, chofer) {

                res.ok(chofer[0]);

            })
        }




    },
    getServicio: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');


        Servicio.findOne({id: servicioId}).exec(function (err, servicio) {

            res.ok(servicio);

        })

    },
    cancelarServicio: function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        var servicioId = req.param('servicioId');
        var that = this;

        Servicio.update({id: servicioId}, { status: 'cancelada', cancelo: 'chofer' }).exec(function (err, serv) {

            if (err) {

                return res.json({err: err});
            }

            Servicio.publishUpdate(serv[0].id, {servicio: serv[0]}, req);

            Cliente.findOne({id: serv[0].cliente}).exec(function (err, cliente) {

                if (err) {
                    return res.json({err: err});
                }

                that._addQueueMsg('cliente', req.session.chofer.id, cliente.id, 'servicio.cancelado', {servicio: serv[0]}).then(function (response) {


                }, function (err) {

                    console.log(err);

                });
//                sails.sockets.broadcast(cliente.socketId, 'servicio.cancelado', {servicio: serv[0]});

                Chofer.update({id: req.session.chofer.id}, {status: 'activo'}).exec(function (err, chofer) {
                    if (err) {
                        return res.json({err: err});
                    }
                    res.ok(serv[0]);
                })



            })

        })


    },
    getServicioPendiente: function (req, res) {


        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.param('ChoferId');

        Servicio.find({
            chofer: choferId,
            status: {'!': ['finalizado', 'cancelada']}
        }).sort('updateAt ASC').exec(function (err, servi) {

            if (err) {
                return res.json({err: err});
            }
            if (servi.length > 0) {
                Servicio.subscribe(req, servi[0].id);
            }

            res.json(servi);

        })

    },
    getSolicitud: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var SolId = req.param('SolId');

        Solicitud.findOne({id: SolId}).exec(function (err, solicitud) {

            if (err) {
                return res.json({err: err});
            }


            res.json(solicitud);

        })
    },
    trackRecorridoServicio: function (req, res) {

        var servicio = req.param('ServId');
        var lat = req.param('lat');
        var lon = req.param('lon');


        Servicio.findOne({id: servicio}).exec(function (err, servicio) {

            var points = servicio.recorridoChofer ? servicio.recorridoChofer : [];

            points.push({lat: lat, lon: lon, date: new Date()});

            Servicio.update({id: servicio}, {recorridoChofer: points}).exec(function (err, servicio) {

                if (err) {
                    return res.json({err: err});
                }

                res.ok(servicio);

            })


        })

    },
    _addQueueMsg: function (tipo, idOrigen, idDestino, evento, data) {

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
        
     

        Queue.create({tipo: tipo, event: evento, idOrigen: idOrigen, idDestino: idDestino, data: data}).exec(function (err, msg) {

            if (err) {
                deferred.reject(new Error(err));
            }


            sails.sockets.broadcast(msg.idDestino[0], msg.event, msg);

            intentos++;

            var interval = setInterval(function (msg) {


                Queue.findOne({id: msg.id}).exec(function (err, msg) {

                    if (err) {
                        deferred.reject(new Error(err));
                    }


                    if (!msg.entregado) {

                        sails.sockets.broadcast(msg.idDestino[0], msg.event, msg);


                        if (intentos == 5) {

                            deferred.reject('msg_no_entregado', msg);

                            clearInterval(interval);

                            Queue.update({id: msg.id}, {intentos: intentos}).exec(function () {

                            });

                        }

                    } else {
                        deferred.resolve(msg);
                        clearInterval(interval);

                        Queue.update({id: msg.id}, {intentos: intentos}).exec(function () {

                        });

                    }

                })


                intentos++;
            }, 10000, msg);


        });

        return deferred.promise;
    },
    getChofer: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.session.chofer.id;


        Chofer.findOne({id: choferId}).exec(function (err, chofer) {

            if (err) {
                return res.json({err: err});
            }

            res.json(chofer);

        })


    },
    getAutos: function (req, res) {


        if (!req.isSocket) {
            return res.badRequest();
        }

        var chofer = req.session.chofer;
        that = this;
        
        if(!chofer){
             return res.json(403, {err: 'Chofer requerido en suscribe.'});
        }
        

        Chofer.findOne({id: chofer.id}).populate('autoActivo').exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            ChoferAuto.find({chofer: chofer.id}).exec(function (err, relations) {

                that.autos = [];

                if (relations.length == 0) {
                    res.json({chofer: chofer, autos: that.autos});


                } else {

                    for (n = 0; n < relations.length; n++) {

                        Auto.findOne({id: relations[n].auto}).exec(function (err, auto) {
                            auto.checked = false;
                            if (chofer.autoActivo) {

                                if (chofer.autoActivo == auto.id) {
                                    auto.checked = true;
                                }

                            }


                            that.autos.push(auto);

                            if (n == relations.length) {
                                res.json({chofer: chofer, autos: that.autos});


                            }

                        })

                    }
                }

            });



        })

    },
    setAutoActivo: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var choferId = req.session.chofer.id;
        var autoId = req.param('idAuto');
        if (!autoId) {
            return res.badRequest();
        }

        that = this;

        Chofer.update({id: choferId}, {autoActivo: autoId}).exec(function (err, updated) {

            if (err) {

                return res.json({err: err});
            }



            Chofer.findOne({id: updated[0].id}).populate('autoActivo').exec(function (err, chofer) {

                res.json(chofer);

            })



        });

    },
    validarEmail: function (req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var email = req.param('email');

        if (email) {

            Chofer.findOne({email: email}).exec(function (err, chofer) {

                if (err) {
                    return res.serverError(err);
                }

                if (chofer) {

                    return res.json({valido: false});

                } else {
                    return res.json({valido: true});
                }

            });

        } else {
            return res.badRequest();
        }

    }


};  