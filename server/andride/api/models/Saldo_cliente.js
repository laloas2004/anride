/**
 * Saldo_chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'MysqlServer',
  attributes: {
      
      cliente:{
          model:'cliente',
          required: true,
          unique: true
      },
      saldo:{
          type: 'float',
          required: true
      }
      
  }
};

