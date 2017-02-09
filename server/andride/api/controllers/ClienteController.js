/**
 * ClienteController
 *
 * @description :: Server-side logic for managing clientes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');


module.exports = {
    getChoferes: function(req, res) {


        var maxDistance = req.param('distance') || 1000;


        ClientCoordinates = {
            lon: req.param('lon'),
            lat: req.param('lat')
        };


        Chofer.getChoferesCercanos(ClientCoordinates).then(function(result) {
            var choferesRes = {};
            
            choferesRes.choferes = result;
            
      
            
            var location1 = {
                lat: req.param('lat'),
                lon: req.param('lon')
            };


            if (result.length == 0) {

               choferesRes.error = "No contamos con servicio en esta area";
            }


            var location2 = {
                lat: result[0].lat,
                lon: result[0].lon
            }
            console.log(location1);
            console.log(location2);

            GmapService.getMatrix(location1, location2).then(function(val) {
                
                choferesRes.matrix = val;
                
                return res.json(choferesRes);
                
            }, function(err) {
                return res.json(err);
            });
//			return res.json(result);
        }, function(err) {
            console.log('Error: En getChoferes .' + err)
        });
    },
    registroCliente: function(req, res) {

        console.log('se ejecuto registrar');

        if (req.isSocket) {



            return res.json(req.socket);

        }

    },
    loginCliente: function(req, res) {

        console.log('se ejecuto registrar');

        if (req.isSocket) {



            return res.json(req.socket);

        }

    },
    logoutCliente: function(req, res) {

        console.log('se ejecuto registrar');

        if (req.isSocket) {



            return res.json(req.socket);

        }

    }
};