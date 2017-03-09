/**
 * Servicio.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        cliente: {
            model: 'cliente',
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
            enum: ['iniciada', 'pickup', 'enproceso', 'finalizado', 'cancelada'],
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
        },
        cancelo: {
            type: "string",
            enum: ['cliente', 'chofer']

        },
        recorridoChofer:{
            type:"array"
        },
        recorridoCliente:{
            type:"array"
        },
        detalleCancel: {
            type: "json",
        }
    }
};