/**
 * Cliente.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var bcrypt = require('bcrypt');

module.exports = {
    
    attributes: {
        nombre: {
            type: "string"
        },
        apellido: {
            type: "string"
        },
        email: {
            type: "email",
            unique: true,
            required: true
        },
        password: {
            type: "string",
            required: true
        },
        numCel: {
            type: 'string',
            unique: true,
            required: true
        },
        solicitudes: {
            collection: 'solicitud',
            via: 'cliente'
        },
        servicios: {
            collection: 'servicio',
            via: 'cliente'
        },
        configuracion: {
            type: 'json'
        },
        socketId: {
            type: 'string'
        },
        online: {
            type: 'boolean',
            defaultsTo: false
        },
        aprovado: {
            type: 'boolean',
            defaultsTo: false
        },
        formasPago: {
            type: 'array'
        },
        formaPagoSel: {
            type: 'string',
            defaultsTo: 'efectivo'
        },
        eliminado: {
            type: 'boolean',
            defaultsTo: false
        },
        emailConfirm: {
            type: 'boolean',
            defaultsTo: false
        },
        numCelConfirm: {
            type: 'boolean',
            defaultsTo: false
        },
        keyValidationEmail: {
            type: 'string'
        },
        keyValidationumCel: {
            type: 'string'
        },
        destinosFrecuentes:{
            type:'array'
        },
        customer_conekta:{
          type: 'json'
        },
        customer_conekta_pruebas:{
          type: 'json'
        }
    },
    comparePassword: function (password, chofer, cb) {

        bcrypt.compare(password, chofer.password, function (err, match) {

            if (err)
                cb(err);
            if (match) {
                cb(null, true);
            } else {
                cb(err);
            }
        })
    },
    changePassword: function (newPassword, cb) {
        this.newPassword = newPassword;
        this.save(function (err, u) {
            return cb(err, u);
        });
    },
    toJSON: function () {
        var obj = this.toObject();
        return obj;
    },
    beforeCreate: function (attrs, cb) {

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(attrs.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    attrs.password = hash;
                    cb();
                }
            });
        });
    },
    beforeUpdate: function (attrs, cb) {

        console.log(attrs);

        if (attrs.password) {

            bcrypt.genSalt(10, function (err, salt) {

                bcrypt.hash(attrs.password, salt, function (err, hash) {

                    if (err) {
                        console.log(err);
                        cb(err);
                    } else {
                        attrs.password = hash;
                        cb();
                    }
                });
            });
        } else {

            cb();

        }
    }
};
