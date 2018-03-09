/**
 * Saldo_prepago.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'MysqlServer',
  attributes: {
      
      chofer:{
          model:'chofer'
      },
      tipo_prepago:{
         type: 'string' 
      },
      monto:{
        type: 'float'
        
      },
      fecha:{
         type: 'datetime' 
      },
      referencia:{
         type: 'string'  
      }
      

  }
};

