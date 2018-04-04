/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var Q = require('q');

module.exports = {
    
    pagos:{
        
      createPago:function( id_chofer, monto_total, id_servicio, referencia){
          
          var deferred = Q.defer();
          
          if(!id_chofer){
              
              deferred.reject(new Error('Falta parametro id_chofer'));
          }
          
          if(!monto_total){
              
              deferred.reject(new Error('Falta parametro monto_total'));
          }
          
          if(!id_servicio){
              
              deferred.reject(new Error('Falta parametro id_servicio'));
          }
          
          if(!referencia){
              
              deferred.reject(new Error('Falta parametro referencia'));
          }
          
          
          Chofer.findOne({id:id_chofer}).exec(function(err,chofer){
              
              if(err){
                  deferred.reject(new Error(err));
              }
              
              
              Servicio.findOne({id:id_servicio})
                      .populate('solicitud')
                      .exec(function(err, servicio){
                  
               if(err){
                   deferred.reject(new Error(err));
              }
              
              
          var id_delegado = chofer.delegado;
          
          if(servicio.solicitud.tipodePago == 'efectivo'){
              
                var id_pago = 1;
              
          }else if(servicio.solicitud.tipodePago == 'tarjeta'){
              
                var id_pago = 2;
                
          }else{
              
              
                var id_pago = 3; 
          }
          
          var sql = "CALL `anride`.`createCobro`( '"+ id_chofer + "','" +
                                                  id_delegado+ "','"+
                                                  monto_total+"','" +
                                                  id_servicio+"','"+
                                                  referencia+"','"+
                                                  servicio.solicitud.tipodePago+"')";
                                          
                                          console.log(sql);
                                          
                                  
           

                    Cobro.query(sql,[],function(err,result){

                        if(err){
                            
                             deferred.reject(new Error(err));
                            
                        }

                      deferred.resolve(result);

                    });
              
                  
              });
              
              
          });
          
          return deferred.promise;
          
      },
      createCorte:function(id_delegado){
          
        var deferred = Q.defer();
          
        if(!id_delegado){
              
              deferred.reject(new Error('Falta parametro id_delegado'));
          }
          
          
        var sql = "CALL `anride`.`createCorte`( '"+id_delegado+"')";
          
        Cobro.query(sql,[],function(err,result){

                if(err){

                     deferred.reject(new Error(err));

                }

              deferred.resolve(result);

            });  
          
          
          
      },
      getCortes:function(id_delegado){
          
        var deferred = Q.defer();
         
        if(!id_delegado){
              
              deferred.reject(new Error('Falta parametro id_delegado'));
          }
          
        var sql = "CALL `anride`.`getCortebyDelegado`( '"+id_delegado+"')";
  
 
        Cobro.query(sql,[],function(err,result){

                if(err){

                     deferred.reject(new Error(err));

                }

              deferred.resolve(result);

            });  
          
          return deferred.promise; 
          
      }
        
        
        
    }
    
    
    
    
};