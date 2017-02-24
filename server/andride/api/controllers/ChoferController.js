/**
 * ChoferController
 *
 * @description :: Server-side logic for managing chofers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


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

        sails.sockets.join(req, 'Choferes', function(err) {
            if (err) {
                return res.serverError(err);
            }

//          sChofer.subscribe(req, _.pluck(usersNamedLouie, 'id'));

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

        var solicitud = req.param('solicitud');
        var chofer = req.param('chofer');

        Solicitud.update({id: solicitud.id}, {
            status: 'aceptada'
        }).exec(function(err, solicitud) {
            if (err) {
                return res.json({err: err});
            }

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


                    Chofer.update({id: chofer.id}, {status: 'enservicio'}).exec(function(err, chofer) {
                        if (err) {
                            return res.json({err: err});
                        }
                        
                        sails.sockets.broadcast(cliente.socketId, 'servicio.iniciada', {servicio: servicio, chofer: chofer[0]});

                        sails.sockets.broadcast(chofer[0].id, 'servicio.iniciada', {servicio: servicio});

                        return res.json({servicio: servicio});
                    })



                })

            })




        })

    },
    onPlace: function(req, res) {

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
   empiezaViaje:function(){
       
   },
   terminaViaje:function(){
       
   }

};  