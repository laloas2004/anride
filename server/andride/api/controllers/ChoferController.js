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




    },
    signup: function(req, res) {

    },
    newChofer: function(req, res) {
    },
    trackChofer: function(req, res) {


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
    }
};  