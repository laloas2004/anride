/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: function(req, res) {

    },
    indexCliente: function(req, res) {

        Cliente.find().exec(function(err, clientes) {

            res.view('clientes/home', {clientes: clientes});

        })



    },
    indexSolicitudes: function(req, res) {
        var limit = req.param('limit') || 20;
        var moment = require('moment');




        Solicitud.find().sort('createdAt desc').limit(limit).populate('cliente').exec(function(err, solicitudes) {
            if (err) {
                return res.json(err.status, {err: err});
            }

            res.view('solicitudes/home', {solicitudes: solicitudes, moment: moment});
        });


    },
    indexServicios: function(req, res) {
        var limit = req.param('limit') || 20;
        Servicio.find().sort('createdAt desc').limit(limit).populate('solicitud').populate('cliente').populate('chofer').exec(function(err, servicios) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            res.view('servicios/home', {servicios: servicios});
        })

    },
    indexChoferes: function(req, res) {

//        if (req.isSocket) {
//            sails.sockets.join(req, "funSockets", function(err) {
//                return res.json({
//                    message: 'Subscribed to a fun room called ' + 'un grupo' + '!'
//                });
//            });
//           
//        }


        Chofer.find().exec(function(err, choferes) {
            console.log(choferes);
            res.view('choferes/home', {choferes: choferes});
        });

    },
    indexAutos: function(req, res) {

        res.view('autos/home', {saludos: 'saludos!!'});
    },
    indexPagos: function(req, res) {

        res.view('pagos/home', {saludos: 'saludos!!'});
    },
    indexConfiguracion: function(req, res) {

        configTaxiapp.get().then(function(config) {

            res.view('configuracion/home', {config: config});

        });

    },
    saveConfiguracion: function(req, res) {

        var params = req.allParams();

        configTaxiapp.save(params).then(function(config) {


            return res.redirect('/admin/configuracion');

        }, function(err) {
            console.log(err);
        });


    },
    newCliente: function(req, res) {
        return res.view('clientes/new_cliente', {});
    },
    saveCliente: function(req, res) {

        var cliente = req.param('cliente');



        Cliente.create(cliente).exec(function(err, cliente) {
            if (err) {
                return res.json(err.status, {err: err});
            }

            console.log(cliente);

            return res.redirect('/admin/clientes');

        })

    },
    editCliente: function(req, res) {

        var clienteId = req.param('cliente');




        if (!clienteId) {
            return res.json(403, {err: 'Id de Cliente es Oblgatorio.'});
        }

        Cliente.findOne({id: clienteId}).exec(function(err, cliente) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            console.log(cliente);

            return res.view('clientes/edit_cliente', {cliente: cliente});

        })



    },
    updateCliente: function(req, res) {

        var cliente = req.param('cliente');
        console.log('Update');
        console.log(cliente);

        if (!cliente) {
            return res.json(403, {err: 'Cliente es Oblgatorio.'});
        }

        if (cliente.password == '') {

            Cliente.update({id: cliente.id}, {nombre: cliente.nombre, apellido: cliente.apellido, numCel: cliente.numCel}).exec(function(err, cliente) {

                if (err) {
                    return res.json(err.status, {err: err});
                }

                return res.redirect('/admin/clientes');


            });
        } else {

            Cliente.update({id: cliente.id}, {nombre: cliente.nombre, apellido: cliente.apellido, numCel: cliente.numCel, newPassword: cliente.password}).exec(function(err, cliente) {

                if (err) {
                    return res.json(err.status, {err: err});
                }

                return res.redirect('/admin/clientes');

            });


        }




    },
    getClienteServicios: function(req, res) {

        var clienteId = req.param('clienteId');

        if (!clienteId) {
            return res.json(403, {err: 'Cliente es Oblgatorio.'});
        }

        Servicio.find({cliente: clienteId, status: 'finalizado'}).sort('updatedAt DESC').populate('cliente').populate('solicitud').exec(function(err, servicios) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            console.log(servicios);

            return res.view('clientes/servicios_cliente', {servicios: servicios});

        })

    },
    getChoferes: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        Chofer.find({online: true}).exec(function(err, choferes) {


            return res.json(choferes);

        });

    },
    newChofer: function(req, res) {

        return res.view('choferes/new_chofer', {});
    },
    saveChofer: function(req, res) {



        var chofer = req.param('chofer');

        Chofer.create(chofer).exec(function(err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }


            console.log(chofer);

            return res.redirect('/admin/choferes');

        })

    },
    deleteChofer: function(req, res) {

        var ChoferId = req.param('choferId');

        Chofer.destroy({id: ChoferId}).exec(function(err) {

            if (err) {
                return res.negotiate(err);
            }

            return res.redirect('/admin/choferes');
        });

    },
    editChofer: function(req, res) {

        var choferId = req.param('choferId');

        if (!choferId) {
            return res.json(403, {err: 'Id de Chofer es Oblgatorio.'});
        }

        Chofer.findOne({id: choferId}).exec(function(err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }



            return res.view('choferes/edit_chofer', {chofer: chofer});

        });

    },
    updateChofer: function(req, res) {

        var chofer = req.param('chofer');

        if (!chofer) {
            return res.json(403, {err: 'Chofer es Oblgatorio.'});
        }
        
        console.log(chofer);

        if (chofer.password) {

            Chofer.update({id: chofer.id}, {}).exec(function() {

                return res.redirect('/admin/choferes');

            });


        } else {

            Chofer.update({id: chofer.id}, {}).exec(function() {

                return res.redirect('/admin/choferes');

            });

        }

    },
    suscribe: function(req, res) {

//     Solicitud.find()




    }
};

