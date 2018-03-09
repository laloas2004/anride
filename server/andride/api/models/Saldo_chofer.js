/**
 * Saldo_chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'MysqlServer',
  attributes: {
      
      chofer:{
          model:'chofer',
          required: true,
          unique: true
      },
      delegado:{
         model:'user',
         required: true
      },
      comision:{
          type: 'integer',
          required: true
      },
      saldo:{
          type: 'float',
          required: true
      }
      
  }
};

