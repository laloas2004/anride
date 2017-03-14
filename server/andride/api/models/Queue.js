/**
 * Queue.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        tipo: {
            type: 'string',
            enum: ['chofer', 'cliente']
        },
        event:{
          type: 'string'  
        },
        idOrigen: {
            type: 'array'
        },
        idDestino: {
            type: 'array'
        },
        rooms: {
            type: 'array'
        },
        data: {
            type: 'json'
        },
        
        entregado: {
            type: 'boolean',
            defaultsTo: false
        },
        intentos:{
            type: 'integer',
            defaultsTo: 0

        }
    }
};

