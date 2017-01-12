/**
 * IndexController
 *
 * @description :: Server-side logic for managing Indices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	getConfig: function (req, res) {
		console.log(' req.isSocket ', req.isSocket);
		console.log(' req.isAjax   ', req.isAjax);
		console.log(' req.isJson   ', req.isJson);
		return res.json(sails.config.andride_configuracion);
	},
};