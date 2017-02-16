/**
 * Auto.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        tarifaxkm: {
            type: "float"
        },
        radioBusqueda: {
            type: "float"
        },
        banderazo: {
            type: "float"
        },
        tarifaxcancel: {
            type: "float"
        },
        cuentaConekta: {
            type: "string"
        },
        keyConekta: {
            type: "string"
        },
        keyGMaps: {
            type: "string"
        },
        radioGPlaces: {
            type: "float"
        },
        razonesCancelChofer: {
            type: "json"
        },
        opcionesCobroExtra: {
            type: "json"
        },
        tiempoEspera: {
            type: "integer"
        },
        cobroxMinTiempoEsp: {
            type: "float"
        },
        opcionesPago: {
            type: "json"
        }

    }
};