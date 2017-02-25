/**
 * Servicio.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        cliente: {
            model: 'Cliente',
        },
        chofer: {
            model: 'Chofer'
        },
        inicio_viaje: {
            type: "json"
        },
        inicio_fecha: {
            type: "datetime"
        },
        fin_viaje: {
            type: "json"
        },
        fin_fecha: {
            type: "datetime"
        },
        status: {
            type: "string",
            defaultsTo: 'iniciada'
        },
        solicitud: {
            model: 'Solicitud'

        },
        tiempo: {
            type: "float"
        },
        distancia: {
            type: "float"
        },
        monto: {
            type: "float"
        }
    }
};