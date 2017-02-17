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

    }
};