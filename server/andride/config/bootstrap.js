/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
module.exports.bootstrap = function (cb) {



    sails.moment = require('moment');
    // Ensure we have 2dsphere index on Property so GeoSpatial queries can work!

    Chofer.update({}, {online: false, status: 'inactivo'}).exec(function (err, choferes) {

    });

    Cliente.update({}, {online: false}).exec(function (err, clientes) {

    });

    sails.models.chofer.native(function (err, collection) {
//		console.log('ejecuto el index de chofer');
        collection.ensureIndex({
            location: '2dsphere'
        }, function () {
            // It's very important to trigger this callack method when you are finished 
            // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
            debugger;
            cb();
        });
    });
};