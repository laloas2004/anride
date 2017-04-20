/**
 * Chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
        nombre: {
            type: 'string',
        },
        apellido: {
            type: 'string'
        },
        email: {
            type: 'email',
            unique: true,
            required: true
        },
        password: {
            type: 'string',
            //required : true
        },
        numCel: {
            type: 'string'
        },
        online: {
            type: 'boolean',
            defaultsTo: false
        },
        location: {
            type: 'json',
        },
        autos: {
            collection: 'Auto',
            via: 'choferes',
            through: 'choferauto',
            dominant: true
        },
        status: {
            type: 'string',
            enum: ['activo', 'inactivo', 'enservicio'],
            defaultsTo: 'inactivo'
        },
        socketId: {
            type: 'string'
        },
        ultimaConexion: {
            type: 'datetime'
        },
        autoActivo: {
            model: 'Auto'
        },
        servicios: {
            collection: 'Servicio',
            via: 'chofer'
        },
        rating: {
            type: 'float'
        },
        aprovado: {
            type: 'boolean',
            defaultsTo: false
        },
        eliminado: {
            type: 'boolean',
            defaultsTo: false
        },
        direccion: {
            type: 'string'
        },
        telefono: {
            type: 'string'
        },
        municipio: {
            type: 'string'
        },
        numLicencia: {
            type: 'string'
        },
        numCelector: {
            type: 'string'
        },
        comDomicioFile: {
            type: 'string'
        },
        credeElectorile:{
            type: 'string'
        },
        liceConducionFile:{
            type: 'string'
        },
        cartaNopenalesFile:{
            type: 'string'
        }
    },
    beforeCreate: function (attrs, cb) {
        console.log(attrs);
        var location = {};
        location.lat = attrs.lat || 0;
        location.lon = attrs.lon || 0;
        attrs.location = {
            type: "Point",
            coordinates: [parseFloat(location.lon), parseFloat(location.lat)]
        };

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


        cb();
    },
    getChoferesCercanos: function (ClientCoordinates, maxDistance, limitChoferes) {

        var maxdist = maxDistance || 16093.4;

        var limit = limitChoferes || 10;

        if (!ClientCoordinates) {

            deferred.reject(new Error('se necesita un punto geografico'));

        }

        var deferred = Q.defer();

        Chofer.native(function (err, collection) {

            if (err)
                return res.serverError(err);

            collection.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(ClientCoordinates.lon), parseFloat(ClientCoordinates.lat)]
                        },
                        $maxDistance: maxdist // 10 miles in meters
                    }
                },
                online: true,
                status: 'activo'

            }, {
                password: 0
            }).limit(limit).toArray(function (err, results) {

                if (err) {

                    deferred.reject(new Error(err));
                }
//                delete results.password;
                deferred.resolve(results);
            });
        })
        return deferred.promise;
    },
    toJSON: function () {

        var obj = this.toObject();
        delete obj.password;
//        delete obj.confirmation;
//        delete obj.encryptedPassword;
//        delete obj._csrf;
        return obj;
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
    }
};
