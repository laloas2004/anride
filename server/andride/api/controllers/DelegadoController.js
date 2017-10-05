/**
 * DelegadoController
 *
 * @description :: Server-side logic for managing Delegadoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    index:function(req,res){
        
   
        
            Chofer.find({delegado:req.session.passport.user}).populate('delegado').exec(function (err, choferes) {

            User.find({rol: 'delegado'}).exec(function (err, delegados) {

                       res.locals.layout = 'panel_delegado/layout';
                       
                return res.view('panel_delegado/home/home', { choferes: choferes, delegados: delegados});

            });


        });
        
        
           
    },
    servicios:function(req,res){
        
         that = this;
        
         this.servicios = [];
         
         var id = req.param('id');
         var limit = req.param('limit') || 20;
         
         if(!id){
         
         async.waterfall([
             function(cb){
                 console.log('serie1');
                 
            Chofer.find({delegado:req.session.passport.user}).populate('delegado').exec(function (err, choferes) {
                
                if(err){
                    
                    console.log(err);
                }
                
                var cantChoferes = _.size(choferes);
                if(cantChoferes == 0){
                    
                    cb();  
                }
                that.cont = 0;

                _.forEach(choferes,function(value, key){
                    

                    Servicio.find({ chofer:value.id }).sort('createdAt desc')
                            .populate('cliente')
                            .populate('chofer')
                            .populate('solicitud')
                            .exec(function(err,servicio){
                        
                       that.servicios = that.servicios.concat(servicio);
                        
                       that.cont++;
                       
                    console.log(cantChoferes);
                    console.log(that.cont);   
                    if(cantChoferes == that.cont){
                        
                       cb(); 
                    }
                    });
                      
                   
                    
                    
                    });
                    
                

             }); 
         
                    
             },
             function(cb){
                 
                
                 
                 cb();
             }
         ],function(err,params){
                
             return res.view('panel_delegado/servicios/home', { servicios:that.servicios });  
             
         });
         }else{
             
                   
        
        Servicio.find({chofer:id}).sort('createdAt desc').limit(limit)
                .populate('solicitud')
                .populate('cliente')
                .populate('chofer')
                .exec(function (err, servicios) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            return res.view('panel_delegado/servicios/home', { servicios:servicios }); 
        })  
             
         }
      
    },
    
    autos:function(req,res){
        
    var choferId = req.param('chofer');
        that = this;

        Chofer.findOne({id: choferId})
                .populate('autos')
                .exec(function (err, chofer) {

            if (err) {
                return res.json(err.status, {err: err});
            }

            ChoferAuto.find({chofer: chofer.id}).exec(function (err, relations) {

                that.autos = [];

                if (relations.length == 0) {
                   return res.view('panel_delegado/autos/home', {chofer: chofer, autos: that.autos});
                } else {

                    for (n = 0; n < relations.length; n++) {

                        Auto.findOne({id: relations[n].auto}).exec(function (err, auto) {

                            that.autos.push(auto);

                            if (n == relations.length) {

                               return res.view('panel_delegado/autos/home', {chofer: chofer, autos: that.autos});


                            }

                        })

                    }
                }

            });



        })
        
    // return res.view('panel_delegado/autos/home', {});      
    },
    
    bloquearChofer:function(req,res){
        
        
        
    }
    
	
};

