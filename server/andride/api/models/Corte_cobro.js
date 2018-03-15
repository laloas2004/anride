/**
 * Corte_cobro.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'MysqlServer',
  attributes: {
      
      delegado:{
          model: 'user'
      },
      fecha_inicial:{
          type: 'datetime'
      },
      fecha_fin:{
          type: 'datetime'
      },
      monto_total_choferes:{
          type: 'float'  
      },
      monto_total_delegado:{
          type: 'float'  
      },
      monto_total_comision:{
          type: 'float'    
      },
      pagado:{
      type: 'boolean',
      defaultsTo: false
      },
      fecha_pagado:{
         type: 'datetime' 
      }
      
      
      
      
  }
};

