/**
 * Queue.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        tipo: {
            type: 'string'
        },
        socketsOrigen: {
            type: 'array'
        },
        socketsDestino: {
            type: 'array'
        },
        rooms: {
            type: 'array'
        },
        dataOrigen: {
            type: 'json'
        },
        dataDestino: {
            type: 'json',
        },
        entregado: {
            type: 'boolean',
            defaultsTo: false
        },
    }
};

