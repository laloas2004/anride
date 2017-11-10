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

        var maxDistance = req.param('distance') || 100000;

        var limitChoferes = 10;

        var ClientCoordinates = {
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
        
        console.log(req.allParams());
        
        var usuario = JSON.parse(req.param('usuario'));
        
       
        if (!usuario.nombre) {
            return res.json(401, {err: 'nombre required'});
        }

        if (!usuario.apellido) {
            return res.json(401, {err: 'apellido required'});
        }

        if (!usuario.celular) {
            return res.json(401, {err: 'celular required'});
        }
        if (!usuario.email) {
            return res.json(401, {err: 'email required'});
        }
        if (!usuario.password) {
            return res.json(401, {err: 'password required'});
        }

        Cliente.create({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            numCel: usuario.celular,
            password: usuario.password
        }).exec(function(err, cliente) {

            if (err) {
                return res.json(403, {err: 'Error al registrar'});
            }

            delete cliente.password;

            res.json({
                cliente: cliente,
                token: jwToken.issue({id: cliente.id})
            });

        });


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
            if (cliente.online) {

                console.log('El Usuario esta en Uso.');
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
                    req.session.cliente = cliente;
                    req.session.cliente.online = true;
                    req.session.clienteId = cliente.id;
                    
                    res.json({
                        cliente: cliente,
                        token: jwToken.issue({id: cliente.id})
                    });

                }

            })
        })

    },
    logout: function(req, res) {

        console.log('se ejecuto logout');

        if (req.isSocket) {

             

            return res.json(req.socket);

        }

    },
    validateToken: function(req, res) {
        
        if(req.session.cliente){
            
             return res.json({ valid: true, cliente:req.session.cliente });
             
        }else{
            
             return res.json({ valid: false });
            
        }
        
       
    },
    suscribe: function(req, res) {

        if (!req.isSocket) {
            
            return res.badRequest();
        }
        
        var socketId = sails.sockets.getId(req);

        var clienteId = req.session.clienteId;

        if (!socketId) {

            return res.json(403, {err: 'Socket Id requerido en suscribe.'});

        }

        if (!clienteId) {
            
            return res.json(403, {err: 'Cliente Id requerido en suscribe.'});

        }
                
               

        sails.sockets.join(req, clienteId, function(err) {

            if (err) {
                return res.serverError(err);
            }

            Cliente.update({id:clienteId}, { socketId: socketId, online: true }).exec(function(err, cliente) {
                
                
                if (err) {
                    
                    console.log(err);
                    return res.json({ suscrito: false });
                }

                console.log(cliente[0]);
                
                return res.json({suscrito: true, cliente:cliente[0]});

            });
        });




    },
    _enviaSolicitudaChofer: function(tiempo_espera, finn) {

        var deferred = Q.defer();

        var num_chofer = 0;
        
        if (finn.choferesDisponibles.choferes) {
            
            try {
                
                var cant_chofer = finn.choferesDisponibles.choferes.length || 0;
                
            } catch (e) {
                
                console.log(e);
            }
        } else {
            var cant_chofer = 0;
        }

        var loop = function(tiempo_espera, finn) {
            var tiempo = 0;

            try {
                
                var solicitud_chofer = finn.choferesDisponibles.choferes[num_chofer];
                
            } catch (e) {

                console.log(e);

            }

            Chofer.findOne({id: solicitud_chofer._id}).exec(function(err, chofer) {

                if (chofer.online && chofer.status == 'activo') {


                    var interval = setInterval(function(tiempo_espera, finn) {

                        if (tiempo == 0) {
                           
                            sails.sockets.broadcast(chofer.id, 'solicitud.enbusqueda', { solicitud: finn, tiempo_espera: tiempo_espera});
                        }

//                        sails.sockets.broadcast(chofer.socketId, 'solicitud.enbusqueda.cont', {tiempo: tiempo, tiempo_espera: tiempo_espera});

                        tiempo++;

                        if (tiempo == tiempo_espera) {
                           
                            sails.sockets.broadcast(chofer.id, 'solicitud.enbusqueda.vencio');

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


                        Solicitud.findOne({id: finn.id}).exec(function(err, record) {

                            if (record.status) {

                                if (record.status == 'aceptada') {
                                   
                                    sails.sockets.broadcast(chofer.id, 'solicitud.enbusqueda.aceptada');
                                    clearInterval(interval);
                                    deferred.resolve({respuesta: 'aceptada'});

                                }
                            }
                        });


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
        
        
       var that = this;

        if (!req.isSocket) {

            return res.badRequest();
        }

//        console.log(req.allParams());

        var solicitud = req.param('solicitud');
        
        if(!solicitud){
          return res.badRequest('solicitud es parametro requerido.');
        }  
        
        if(solicitud == null){
            
            return res.badRequest('solicitud no puede ser null.');
        }
        
        var origen = req.param('origen');
        
        if(!origen){
            
          return res.badRequest('origen es parametro requerido.');  
        }
        
        if(origen == null){
            
           return res.badRequest('origen no puede ser null.');   
        }
        
        if(!origen.coords.latitude || !origen.coords.longitude){
            
           return res.badRequest('origen no tiene longitud o latitud.');  
        }
        
        var socketId = sails.sockets.getId(req);
        
        var cliente = req.session.cliente;
        
        if(!cliente){
            
            console.log('no esxiste la session del cliente');
        }
        
       
        
        var tiempo_espera = 30;

            
        Solicitud.create({
            origen: origen,
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

            sails.sockets.broadcast(cliente.id, 'solicitud.creada', finn);
            
            sails.sockets.blast('solicitud', finn, req);

            Solicitud.subscribe(req, finn.id);
            Solicitud.publishCreate(finn, req);
            
            that._enviaSolicitudaChofer(tiempo_espera, finn).then(function(respuesta) {

                return res.json({respuesta: respuesta, solicitud: finn});

            }, function(err) {

                return res.json({err: err});
            })

        });

    },
    suscribeChofer: function(req, res) {
        

        if (!req.isSocket) {

            return res.badRequest();
        }

        var choferId = req.param('choferId');

        Chofer.subscribe(req, choferId);

        Chofer.findOne({id: choferId}).exec(function(err, chofer) {
            if (err) {
                return res.json({err: err});
            }
            return res.ok(chofer);

        })

    },
    cancelarServicio: function(req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }

        var servicioId = req.param('servicioId');

        Servicio.update({id: servicioId}, { status: 'cancelada', cancelo: 'cliente'}).exec(function(err, serv) {

            if (err) {
                
                return res.json({err: err});
            }
            
            


            try {

                Servicio.publishUpdate(serv[0].id, {servicio: serv[0]}, req);

            } catch (e) {

                console.log(e);

            }


            res.ok(serv[0]);


        })


    },
    getViajes: function(req, res) {

        if (!req.isSocket) {

            return res.badRequest();
        }
        
        var clienteId = req.session.clienteId;

        if (!clienteId) {
            return res.json(403, {err: 'Session required'});
        }

        Servicio.find({where:{cliente: clienteId,status:'finalizado' },limit:30, sort:'createdAt DESC'}).populate('solicitud').exec(function(err, servi) {

            if (err) {
                return res.json({err: err});
            }      

            res.json(servi);

        });

    },
    getServicioPendiente: function(req, res) {


        if (!req.isSocket) {
            return res.badRequest();
        }

        var clienteId = req.param('clienteId');


        Servicio.find({
            cliente: clienteId,
            status: {'!': ['finalizado', 'cancelada']}
        }).populate('chofer').sort('updateAt ASC').exec(function(err, servi) {

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
    confirmaMsg: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var idMsg = req.param('idQueue');
        
        if(!idMsg){
           return res.json(403, {err: 'Id de Mensaje required'});  
        }

        if (!idMsg) {
            console.log('Falta parametro idMsg')

        }

        Queue.update({id: idMsg}, {entregado: true}).exec(function(err, queue) {

            if (err) {
                return res.json(err);
            }
            return res.json(queue);

        })

    },
    getQueueMsg: function(req, res) {

        if (!req.isSocket) {
            
            return res.badRequest();
        }
        

        var idCliente = req.session.clienteId;

        if (idCliente) {

            Queue.findOne({idDestino: {"$in": [idCliente]}, entregado: false}).exec(function(err, msg) {

                if (err) {

                    return res.serverError(err);
                }

                if (msg) {

                    sails.sockets.broadcast(msg.idDestino[0], msg.event, msg);
                }
                res.ok({ok: true, msg: msg});
            })

        }
    },
    getServicioStatus: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var id = req.param('idServicio');

        if (!id) {

            return res.json({err: 'Falta parametro id obligatorio'});
        }

        Servicio.findOne({id: id}).exec(function(err, servicio) {

            if (err) {

                return res.serverError(err);
            }

            return res.json({status: servicio.status});

        })
    },
    validarEmail: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }

        var email = req.param('email');
        var numCel = req.param('numCel');

        var respuesta = { emailValido:true, numCelValido:true };

        if (email && numCel) {

            Cliente.findOne({ email: email }).exec(function(err, cliente) {

                            if (err) {
                                return res.serverError(err);
                            }

                            if (cliente) {
                                
                               respuesta.emailValido = false;

                            } 
                
                 Cliente.findOne({ numCel:numCel.toString()}).exec(function(err, cliente2) {

                            if (err) {
                                return res.serverError(err);
                            }

                            if (cliente2) {

                               respuesta.numCelValido = false;

                            } 

                          
                     
                     return res.json(respuesta);
                            

                 });

            });
            
        } else {
            
            return res.badRequest('Falta parametros requeridos.');
        }

    },
    addPayment: function(req, res) {

        if (!req.isSocket) {
            return res.badRequest();
        }
        var pago = req.param('data');
        var clienteId = req.session.clienteId;

        Cliente.findOne({id: clienteId}).exec(function(err, cliente) {

            if (err) {
                return res.json({err: err});
            }
          var id = cliente.formasPago.length+1; 

          cliente.formasPago.push({id:id,data:pago});  
            

        });


    },
    getPayments:function(req, res){
        
        
        
        
    }

};