/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var passport = require('passport');
moment = require('moment');
var gcm = require('node-gcm');

module.exports = {
    home: function (req, res) {
        
        
        User.findOne({id:req.session.passport.user}).exec(function(err,response){
                      
                      if(err){
                          console.log(err);
                      }
                      
                     req.session.user = response;
                     
              if(req.session.user.rol == 'delegado'){
            
                console.log('es delegado');
                
                
            
                return res.redirect('/admin/delegados/panel');
            
                 }else{
                     
                        
        
        
    
        var start_today = moment().startOf('day').format(); // set to 12:00 am today
        var end_today = moment().endOf('day').format(); // set to 23:59 pm today
        var clientes_conectados = "";
        var choferes_conectados = "";
        var servicios_hoy = "";
        var solicitudes_hoy = "";


        Solicitud.find().where({'createdAt': {$gte: start_today, $lt: end_today}}).exec(function (err, solictudes) {

            if (err) {

                return res.json(err.status, {err: err});

            }

            solicitudes_hoy = solictudes.length;

            Servicio.find({createdAt: {$gte: start_today, $lt: end_today}}).exec(function (err, servicios) {

                if (err) {

                    return res.json(err.status, {err: err});
                }

                servicios_hoy = servicios.length;




                Cliente.find({online: true}).exec(function (err, clientes) {


                    if (err) {
                        return res.json(err.status, {err: err});
                    }


                    clientes_conectados = clientes.length;

                    Chofer.find({online: true}).exec(function (err, choferes) {

                        if (err) {
                            return res.json(err.status, {err: err});
                        }


                        choferes_conectados = choferes.length;

                        res.view('homepage', {
                            clientes_conectados: clientes_conectados,
                            choferes_conectados: choferes_conectados,
                            servicios_hoy: servicios_hoy,
                            solicitudes_hoy: solicitudes_hoy});
                    });

                });

            });
            });
            }
         });
    },
    login: function (req, res) {


        passport.authenticate('local', function (err, user, info) {


            if ((err) || (!user)) {

                return res.send({
                    message: info.message,
                    user: user
                });

            }
            req.logIn(user, function (err) {
                
                if (err){
                    
                     res.send(err);
                }
                
               
                  
                  
                return res.redirect('/');

//                return res.send({
//                    message: info.message,
//                    user: user
//                });
            });

        })(req, res);
    },
    logout: function (req, res) {
        req.logout();
        res.redirect('/');
    },
    user: function (req, res) {

        var email = req.param('email');

        var password = req.param('password');

        User.create({email: email, password: password}).exec(function (err, user) {



            if (err) {

                return res.json(err.status, {err: err});
            }


            return res.redirect('/');

        });

    },
    index: function (req, res) {
        
        

    },
    indexCliente: function (req, res) {

        Cliente.find().exec(function (err, clientes) {

            res.view('clientes/home', {clientes: clientes});

        })



    },
    indexSolicitudes: function (req, res) {
        
        var limit = req.param('limit') || 20;
        var moment = require('moment');

        Solicitud.find().sort('createdAt desc').limit(limit).populate('cliente').exec(function (err, solicitudes) {
            if (err) {
                return res.json(err.status, {err: err});
            }

            res.view('solicitudes/home', {solicitudes: solicitudes, moment: moment});
        });


    },
    newSolicitud: function (req, res) {


        res.view('solicitudes/new_solicitud', {moment: moment});
    },
    indexServicios: function (req, res) {
        
        var limit = req.param('limit') || 20;
        
        Servicio.find().sort('createdAt desc').limit(limit).populate('solicitud').populate('cliente').populate('chofer').exec(function (err, servicios) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            res.view('servicios/home', {servicios: servicios});
        })

    },
    detalleServicios:function(req, res){
        
      var servi_id = req.param('serv_id');
      
      Servicio.find({id:servi_id}).populate('solicitud').exec(function(err,servicio){
          
         if (err) {
                return res.json(err.status, {err: err});
            } 
          
          console.log(servicio);
          
          res.view('servicios/detalle', {servicio: servicio[0]});
          
      });
        
        
    },
    indexChoferes: function (req, res) {

        Chofer.find().populate('delegado').exec(function (err, choferes) {
//            console.log(choferes);

            User.find({rol: 'delegado'}).exec(function (err, delegados) {


                return res.view('choferes/home', {choferes: choferes, delegados: delegados});

            });


        });

    },
    indexAutos: function (req, res) {

        var choferId = req.param('chofer');
        that = this;

        Chofer.findOne({id: choferId}).populate('autos').exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            ChoferAuto.find({chofer: chofer.id}).exec(function (err, relations) {

                that.autos = [];

                if (relations.length == 0) {
                    
                   return res.view('autos/home', {chofer: chofer, autos: that.autos});
                    
                } else {

                    for (var n = 0; n <= relations.length; n++) {

                        Auto.findOne({id: relations[n].auto}).exec(function (err, auto) {

                            that.autos.push(auto);

                            if (n == relations.length) {

                              return  res.view('autos/home', { chofer: chofer, autos: that.autos });


                            }

                        })

                    }
                }

            });



        })

    },
    newAuto: function (req, res) {

        var choferId = req.param('chofer');

        Chofer.findOne({id: choferId}).exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }


            res.view('autos/new_auto', {chofer: chofer});

        })


    },
    saveAuto: function (req, res) {

        var auto = req.param('auto');

        var chofer = auto.chofer;



        Auto.create(auto).exec(function (err, auto) {

            if (err) {
                return res.json(err.status, {err: err});
            }


            auto.choferes.add(chofer);

            auto.save(function (err) {

                return res.redirect('/admin/choferes');


            });



        });


    },
    indexPagos: function (req, res) {
        
        var moment = require('moment');
        
        Cobro.find({corte:null})
                .sort('createdAt DESC')
                .exec(function(err, cobros){
            
            if(err){
                
                console.log(err);
            }
            
            res.view('pagos/home', { cobros:cobros,moment:moment });
            
            
        });

        
    },
    indexConfiguracion: function (req, res) {

        configTaxiapp.get().then(function (config) {

            res.view('configuracion/home', {config: config});

        });

    },
    saveConfiguracion: function (req, res) {

        var params = req.allParams();

        configTaxiapp.save(params).then(function (config) {


            return res.redirect('/admin/configuracion');

        }, function (err) {

            console.log(err);
        });


    },
    newCliente: function (req, res) {
        return res.view('clientes/new_cliente', {});
    },
    saveCliente: function (req, res) {

        var cliente = req.param('cliente');

        cliente.email = cliente.email.toLowerCase();

        Cliente.create(cliente).exec(function (err, cliente) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            console.log(cliente);

            return res.redirect('/admin/clientes');

        })

    },
    editCliente: function (req, res) {

        var clienteId = req.param('cliente');




        if (!clienteId) {
            return res.json(403, {err: 'Id de Cliente es Oblgatorio.'});
        }

        Cliente.findOne({id: clienteId}).exec(function (err, cliente) {

            if (err) {
                return res.json(err.status, {err: err});
            }

//            console.log(cliente);

            return res.view('clientes/edit_cliente', {cliente: cliente});

        })



    },
    validateCliente: function (req, res) {

    },
    updateCliente: function (req, res) {

        var cliente = req.param('cliente');
        console.log('Update');
        console.log(cliente);

        if (!cliente) {
            return res.json(403, {err: 'Cliente es Oblgatorio.'});
        }

        if (cliente.password == '') {

            Cliente.update({id: cliente.id}, {nombre: cliente.nombre, apellido: cliente.apellido, numCel: cliente.numCel}).exec(function (err, cliente) {

                if (err) {
                    return res.json(err.status, {err: err});
                }

                return res.redirect('/admin/clientes');


            });
        } else {

            Cliente.update({id: cliente.id}, {nombre: cliente.nombre, apellido: cliente.apellido, numCel: cliente.numCel, password: cliente.password}).exec(function (err, cliente) {

                if (err) {
                    return res.json(err.status, {err: err});
                }

                return res.redirect('/admin/clientes');

            });


        }




    },
    getClienteServicios: function (req, res) {

        var clienteId = req.param('clienteId');

        if (!clienteId) {
            return res.json(403, {err: 'Cliente es Oblgatorio.'});
        }

        Servicio.find({cliente: clienteId, status: 'finalizado'}).sort('updatedAt DESC').populate('cliente').populate('solicitud').exec(function (err, servicios) {

            if (err) {
                return res.json(err.status, {err: err});
            }

//            console.log(servicios);

            return res.view('clientes/servicios_cliente', {servicios: servicios});

        })

    },
    getChoferes: function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        Chofer.find({online: true}).exec(function (err, choferes) {


            return res.json(choferes);

        });

    },
    newChofer: function (req, res) {


        User.find({rol: 'delegado'}).exec(function (err, delegados) {
            return res.view('choferes/new_chofer', {delegados: delegados});

        });


    },
    saveChofer: function (req, res) {

        var chofer = req.param('chofer');

        Chofer.create(chofer).exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }


//            console.log(chofer);

            return res.redirect('/admin/choferes');

        });

    },
    deleteChofer: function (req, res) {

        var ChoferId = req.param('choferId');

        Chofer.destroy({id: ChoferId}).exec(function (err) {

            if (err) {
                return res.negotiate(err);
            }

            return res.redirect('/admin/choferes');
        });

    },
    bloquearChofer:function(req, res){
        
        var ChoferId = req.param('choferId'); 
        
        if(!ChoferId){
            
            return res.badRequest('Falta parametro Requerido');
        }
        
      Chofer.findOne({id:ChoferId}).exec(function(err,chofer){
          
          if (err) {
                return res.serverError(err);
            }
            
            console.log(chofer);
            
            if(chofer.bloqueado == true){
                
                chofer.bloqueado = false;
                chofer.save(function(err){
                    
                    if (err) {
                         return res.serverError(err);
                    }
                    
                    return res.redirect('/admin/choferes');
                    
                });
            }else{
                
                chofer.bloqueado = true;
                chofer.save(function(err){
                    
                    if (err) {
                         return res.serverError(err);
                    }
                    
                    return res.redirect('/admin/choferes');
                    
                });
            }
          
      });
        
        
    },
    editChofer: function (req, res) {

        var choferId = req.param('choferId');

        if (!choferId) {
            return res.json(403, {err: 'Id de Chofer es Oblgatorio.'});
        }

        Chofer.findOne({id: choferId}).populate('delegado').exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }


            User.find({rol: 'delegado'}).exec(function (err, delegados) {

                return res.view('choferes/edit_chofer', {chofer: chofer, delegados: delegados});

            });
        });

    },
    updateChofer: function (req, res) {

        var chofer = req.param('chofer');

        if (!chofer) {
            return res.json(403, {err: 'Chofer es Oblgatorio.'});
        }

//        console.log(chofer);

        if (chofer.password == "") {

            delete chofer.password;

            Chofer.update({id: chofer.id}, chofer).exec(function () {
                
                Saldo_chofer.update({chofer:chofer.id},{ delegado:chofer.delegado}).exec(function(err){
                    
                    console.log(err);
                });

                return res.redirect('/admin/choferes');

            });


        } else {

            Chofer.update({id: chofer.id}, chofer).exec(function () {
                
                Saldo_chofer.update({chofer:chofer.id},{ delegado:chofer.delegado}).exec(function(err){
                    
                    console.log(err);
                });

                return res.redirect('/admin/choferes');

            });

        }

    },
    suscribe: function (req, res) {

//     Solicitud.find()




    },
    indexDelegados: function (req, res) {

        User.find({rol: 'delegado'}).exec(function (err, delegados) {

            res.view('delegados/home', {delegados: delegados});

        });


    },
    newDelegado: function (req, res) {

        return res.view('delegados/new_delegado', {});
    },
    saveDelegado: function (req, res) {

        var delegado = req.param('delegado');
        
        if(!delegado){
            
           return res.badRequest('Falta parametro requerido'); 
        }

        User.create(delegado).exec(function (err, user) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            return res.redirect('/admin/delegados');

        });

    },
    editDelegado:function(req, res){
        var id = req.param('id');
        
        if(!id){
            return res.badRequest('Falta parametro requerido.');
        }
        
      User.findOne({id:id}).exec(function(err,delegado){
         
          if(err){
              return res.serverError(err); 
          }
          
         res.view('delegados/edit_delegado', {delegado:delegado});  
          
      });  
        
    },
    updateDelegado:function(req, res){
       
        var delegado = req.param('delegado'); 
        
        if(!delegado){
            
           return res.badRequest('Falta parametro requerido'); 
        }
        
        var id = delegado.id;
        
        console.log(delegado);
        
        delete delegado.id;
       
       if(delegado.password == ''){
           
           delete delegado.password;
        }
        
        delegado.email = delegado.email.toLowerCase();
     
      User.update({ id:id },delegado).exec(function (err, user) {

            if (err) {
                 return res.serverError(err); 
            }

            return res.redirect('/admin/delegados');

        }); 
        
        
    },
    _sendPushNotification: function (msg) {

        var sender = new gcm.Sender('YOUR_API_KEY_HERE');

        // Prepare a message to be sent 
        var message = new gcm.Message({
            data: {key1: 'msg1'}
        });

// Specify which registration IDs to deliver the message to 
        var regTokens = ['YOUR_REG_TOKEN_HERE'];

// Actually send the message 
        sender.send(message, {registrationTokens: regTokens}, function (err, response) {
            if (err)
                console.error(err);
            else
                console.log(response);
        });


    }
};

