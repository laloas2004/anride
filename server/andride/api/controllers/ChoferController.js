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
//                    debugger;
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
        console.log(req.allParams());

        sails.log('My socket ID is: ' + socketId);

        sails.sockets.join(req, 'Choferes', function(err) {
            if (err) {
                return res.serverError(err);
            }

            Chofer.update({id: choferId}, {socketId: socketId,online:true}).exec(function() {
                if (err) {
                    return res.json({suscrito: false});
                }

                return res.json({suscrito: true,socketId: socketId});

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
        
        Chofer.update({socketId: socketId}, 
                      {lat:lat, lon:lon, location:{type: "Point", coordinates:[parseFloat(lon),parseFloat(lat)]}})
              .exec(function(err, updated) {
            if (err) {
                // handle error here- e.g. `res.serverError(err);`
                return res.json({updated: false});
            }
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
    solicitud: function(req, res) {
//        console.log(req);
//        sails.sockets.blast('trabajo', {sockest: true});
            Chofer.update({nombre:'mas'}, {lat:'25.7461718', lon:'-100.2967787',location:{type: "Point",coordinates:[-100.2967787,25.7461718]}}).exec(function(err, updated) {
            if (err) {
                // handle error here- e.g. `res.serverError(err);`
                return res.json({updated: false,err:err});
            }
            return res.json({updated: true,updat:updated});
        })
    }
};  