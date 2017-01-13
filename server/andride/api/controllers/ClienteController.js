/**
 * ClienteController
 *
 * @description :: Server-side logic for managing clientes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Q = require('q');
module.exports = {
	getChoferes: function (req, res) {
		var maxDistance = req.param('distance') || 1000;
		try {
			/*req.validate({
				lat: {
					type: 'string'
				},
				lon: {
					type: 'string'
				}
			});*/
		} catch (err) {
			return res.send(400, err);
		}
		ClientCoordinates = {
			lon: req.param('lon'),
			lat: req.param('lat')
		};
		Chofer.getChoferesCercanos(ClientCoordinates).then(function (result) {
			return res.json(result);
		});
	},
};