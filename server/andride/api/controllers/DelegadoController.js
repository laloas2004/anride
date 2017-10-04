/**
 * DelegadoController
 *
 * @description :: Server-side logic for managing Delegadoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    index:function(req,res){
        
        debugger;
        
            Chofer.find({delegado:req.session.passport.user}).populate('delegado').exec(function (err, choferes) {

            User.find({rol: 'delegado'}).exec(function (err, delegados) {

                       res.locals.layout = 'panel_delegado/layout';
                       
                return res.view('panel_delegado/home/home', {choferes: choferes, delegados: delegados});

            });


        });
        
        
           
    },
    servicios:function(req,res){
        
        
        
    },
    
    autos:function(req,res){
        
        
    }
    
	
};

