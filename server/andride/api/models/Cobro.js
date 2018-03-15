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
    model:'Servicio',
    required: true,
    unique: true
   },
   chofer:{
    model:'chofer'

   },
   tipo_pago:{
    model:'tipo_pago'

   },
   fecha:{
       type: 'datetime'
   },
   referencia_bancaria:{
       type: 'string'
   },
   cobrado:{
      type: 'boolean',
      defaultsTo: false
   },
   corte:{
     model:'corte_cobro'
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

