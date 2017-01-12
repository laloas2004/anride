/**
 * Chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
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
			type: 'string'
		},
		servicios: {
			collection: 'Servicio',
			via: 'chofer'
		}
	}
};