/**
 * Chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

  	nombre : {
			type : 'string',

		},
		apellido : {
			type : 'string'
		},
		email : {
			type : 'email',
			unique : true,
			required : true
		},
		password : {
			type : 'strig',
			required : true
		},
		numCel : {
			type : 'string'
		},
		online : {
			type : 'boolean',
			defaultsTo : false
		},

		location : {
			index : '2d',
			longitude : {
				type : 'float',
				required : true,
			},
			latitude : {
				type : 'float',
			}
		},
		autos : {
			collection: 'Auto',
			via:'choferes',
			dominant: true
		},
		status : {
			type : 'string',
			enum : ['activo', 'inactivo', 'enservicio'],
			defaultsTo : 'inactivo'
		},
		socketId : {
			type : 'string'
		},
		ultimaConexion : {
			type : 'datetime'
		},
		autoActivo : {
			type : 'string'
		}

  }
};

