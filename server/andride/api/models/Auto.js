/**
 * Auto.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        marca: {
            type: "string"
        },
        modelo: {
            type: "string"
        },
        color: {
            type: "string"
        },
        placas: {
            type: "string"
        },
        anio: {
            type: "integer"
        },
        imagen: {
            type: "string"
        },
        
        choferes: {
            collection: 'chofer',
            via: 'autos'
        },
        empSeguro:{
          type: "string"    
        },
        numSeguro:{
           type: "string"    
        },
        vigenciaPoliza:{
          type: "date"      
        },
        PolizaSegFile: {
            type: "string"
        },
        eliminado: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};