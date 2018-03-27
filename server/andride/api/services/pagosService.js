/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    
    pagos:{
        
      createPago:function(id_chofer,id_delegado,monto_total,id_viaje,referencia,tipo_pago){
          
          if(!id_chofer){
              
              return false;
          }
          
          if(!id_delegado){
              
              return false;
          }
          
          if(!monto_total){
              
              return false;
          }
          
          if(!id_viaje){
              
              return false;
          }
          
          if(!referencia){
              
              return false;
          }
          
          if(!tipo_pago){
              
              return false;
          }
          
          
          var sql = "CALL `anride`.`createCobro`( "+ id_chofer + "," +
                                                  id_delegado+ ","+
                                                  monto_total+"," +
                                                  id_viaje+","+
                                                  referencia+","+
                                                  tipo_pago+")";
                                          
                                          console.log(sql);

         /* Cobro.query(sql,[],function(err,result){
              
              
              
          });*/
          
      },
      createCorte:function(){
          
          
          
      }
        
        
        
    }
    
    
    
    
};