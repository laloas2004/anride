/**
 * Cliente.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt = require('bcrypt-nodejs');

module.exports = {
    attributes: {
        nombre: {
            type: "strig"
        },
        apellidos: {
            type: "string"
        },
        email: {
            type: "string"
        },
        password: {
            type: "string"
        },
        numCel: {
            type: 'string'
        },
        solicitudes: {
            collection: 'Solicitud',
            via: 'cliente'
        },
        servicios: {
            collection: 'Servicio',
            via: 'cliente'
        }
    },
    verifyPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    },
    changePassword: function(newPassword, cb) {
        this.newPassword = newPassword;
        this.save(function(err, u) {
            return cb(err, u);
        });
    },
    toJSON: function() {
        var obj = this.toObject();
        return obj;
    },
    beforeCreate: function(attrs, cb) {
        bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function(err, hash) {
            attrs.password = hash;
            return cb();
        });
    },
    beforeUpdate: function(attrs, cb) {
        if (attrs.newPassword) {
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err)
                    return cb(err);
                bcrypt.hash(attrs.newPassword, salt, function(err, crypted) {
                    if (err)
                        return cb(err);
                    delete attrs.newPassword;
                    attrs.password = crypted;
                    return cb();
                });
            });
        } else {
            return cb();
        }
    }
};