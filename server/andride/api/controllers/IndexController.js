/**
 * IndexController
 *
 * @description :: Server-side logic for managing Indices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 
 */
var Q = require('q');

module.exports = {
    
    getConfig: function(req, res) {
        console.log(' req.isSocket ', req.isSocket);
        console.log(' req.isAjax   ', req.isAjax);
        console.log(' req.isJson   ', req.isJson);
        return res.json(sails.config.andride_configuracion);
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
        
        var tiempo = parseFloat(req.param('timepo'));
        var distancia = parseFloat(req.param('distancia'));

        var tarifa_base = 9;
        var tarifakm = 8;
        var tarifaxmin = 3;
        var monto = 0;


        monto = tarifa_base + (tarifakm * (distancia / 1000));


        return res.json({montoEstimado: monto});

    }
};