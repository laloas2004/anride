/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    indexCliente: function(req, res) {
        
        Cliente.find().exec(function(err,clientes){
             console.log(clientes);
             res.view('clientes/home', {clientes:clientes});
            
        })

       

    },
    indexSolicitudes: function(req, res) {
        
        res.view('solicitudes/home', {solicitudes:{}});
    },
    indexServicios: function(req, res) {
        sails.sockets.blast('algo',{res:'haz algo socket!'});
        res.view('servicios/home', {saludos: 'saludos!!'});
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

        res.view('configuracion/home', {saludos: 'saludos!!'});
    },
    newCliente: function(req, res) {
      return res.view('clientes/new_cliente', {});     
    },
    saveCliente:function(req, res){
        
      var cliente = req.param('cliente');
      
    Cliente.create(cliente).exec(function(err, cliente){
         if (err) {
                return res.json(err.status, {err: err});
            }
            
          console.log(cliente);
        
         return res.redirect('/admin/clientes');  
          
      })
    },
    newChofer:function(req, res){
        
      return res.view('choferes/new_chofer', {});      
    },
    saveChofer:function(req, res){
     
       
        
     var chofer = req.param('chofer');   
        
     Chofer.create(chofer).exec(function(err,chofer){
         
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
    suscribe:function(req, res){
        
//     Solicitud.find()
     
     
     
        
    }
};

