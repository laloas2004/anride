/**
 * Solicitud.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        origen: {
            type: "json"
        },
        destino: {
            type: "json"
        },
        matrix: {
            type: "json"
        },
        estimacion: {
            type: "float"
        },
        cliente: {
            model: 'Cliente'
        },
        direccion_origen: {
            type: "string"
        },
        direccion_destino: {
            type: "string"
        },
        choferesDisponibles: {
            type: "json"
        },
        tipodePago: {
            type: "string"
        },
        status:{
          type: "string",
          defaultsTo: 'confirmada'
        }
        
    }
};