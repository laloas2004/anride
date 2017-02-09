/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    indexCliente: function(req, res) {

        res.view('clientes/home', {saludos: 'saludos!!'});

    },
    indexSolicitudes: function(req, res) {

        res.view('solicitudes/home', {saludos: 'saludos!!'});
    },
    indexServicios: function(req, res) {

        res.view('servicios/home', {saludos: 'saludos!!'});
    },
    indexChoferes: function(req, res) {

        res.view('choferes/home', {saludos: 'saludos!!'});
    },
    indexAutos: function(req, res) {

        res.view('autos/home', {saludos: 'saludos!!'});
    },
    indexPagos: function(req, res) {

        res.view('pagos/home', {saludos: 'saludos!!'});
    },
    indexConfiguracion: function(req, res) {

        res.view('configuracion/home', {saludos: 'saludos!!'});
    }
};

