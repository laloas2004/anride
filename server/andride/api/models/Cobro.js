/**
 * Cobros.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'MysqlServer',
  attributes: {
      
   viaje:{
       type: 'string'
   },
   chofer:{
       type: 'string'
   },
   tipo_pago:{
       type: 'string'
   },
   fecha:{
       type: 'datetime'
   },
   referencia_bancaria:{
       type: 'string'
   },
   cobrado:{
      type: 'boolean' 
   },
   corte:{
     type: 'string'  
   },
   monto_total:{
     type: 'float'  
   },
   monto_comision:{
     type: 'float'  
   },
   monto_chofer:{
     type: 'float'  
   }

  }
};

