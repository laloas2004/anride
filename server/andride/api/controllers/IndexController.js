/**
 * IndexController
 *
 * @description :: Server-side logic for managing Indices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 
 */
var Q = require('q');


module.exports = {
    getConfig: function(req, res) {

        configTaxiapp.get().then(function(config) {

            res.json(config);

        });

    },
    getDireccion: function(req, res) {
        console.log(' req.isSocket ', req.isSocket);
        console.log(' req.isAjax   ', req.isAjax);
        console.log(' req.isJson   ', req.isJson);
        var location = {
            latitude: req.param('latitude'),
            longitud: req.param('longitud')
        }
        console.log(req.allParams());
        GmapService.getDireccion(location).then(function(val) {
            return res.json(val);
        });
    },
    getMatrix: function(req, res) {
        var location1 = {
            lat: req.param('lat1'),
            lon: req.param('lon1')
        }
        var location2 = {
            lat: req.param('lat2'),
            lon: req.param('lon2')
        }
        GmapService.getMatrix(location1, location2).then(function(val) {
            return res.json(val);
        });
    },
    montoEstimado: function(req, res) {

        var tiempo = parseFloat(req.param('tiempo'));
        var distancia = parseFloat(req.param('distancia'));
        
        console.log(tiempo);
        console.log(distancia);

        if (!tiempo) {

            console.log('falta parametro tiempo');
        }

        if (!distancia) {
            console.log('falta parametro distancia');
        }

        configTaxiapp.get().then(function(config) {



            var tarifa_base = parseFloat(config.tarifa_base);
            var tarifakm = parseFloat(config.tarifa_kilometro);
            var tarifaxmin = parseFloat(config.tarifa_minuto);
            var tarifa_mini = parseFloat(config.tarifa_minima);
            var monto = 0;

            monto = tarifa_base + ((tarifakm * (distancia / 1000)));


            if (monto < tarifa_mini) {

                monto = tarifa_mini;
            }

            return res.json({montoEstimado: monto});
        }, function(err) {

            return res.badRequest();
        });

    }
};