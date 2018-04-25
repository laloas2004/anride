/**
 * PagoController
 *
 * @description :: Server-side logic for managing pagoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var conekta = require('conekta');


module.exports = {

  getFormasPago:function(req, res){

            if (!req.isSocket) {

            return res.badRequest();
        }

        var cliente = req.session.cliente;

        if(!cliente){
          return res.badRequest('No existe session');
        }


        return res.ok({ formasPago:formasPago,formaPagoSel:formaPagoSel });

  },
  setFormasPago:function(req, res){

            if (!req.isSocket) {

            return res.badRequest();
        }

        var cliente = req.session.cliente;
        var forma_pago = req.param('forma_pago');

        if(!cliente){
          return res.badRequest('No existe session');
        }

        if(!forma_pago){
          return res.badRequest('No existe forma_pago');
        }

        console.log(forma_pago);

        Cliente.update({id:cliente.id},{formaPagoSel:forma_pago}).exec(function(err, clientes_updated){

          if(err){
            return res.serverError(err);
          }

          return res.ok({formasPago:clientes_updated[0].formasPago,formaPagoSel:clientes_updated[0].formaPagoSel});

        });




  },
  crearClienteConekta:function(req, res){

         if (!req.isSocket) {

            return res.badRequest();
        }

        conekta.locale = 'es';
        conekta.api_version = '2.0.0';
        conekta.api_key = "key_eYvWV7gSDkNYXsmr";

  },
  addFormaPagoConekta:function(req, res){

         if (!req.isSocket) {

            return res.badRequest();
        }

        var cliente = req.session.cliente;

        var pago = 0;

        if(!cliente){
          return res.badRequest('No existe session');
        }


  },
  getTarjetasDisponibles:function(req, res){

    if (!req.isSocket) {

        return res.badRequest();
    }

    var cliente = req.session.cliente;
    var customer = {};

    if(!cliente){

      return res.badRequest('No existe session cliente');
    }

    Cliente.findOne({id:cliente.id}).exec(function(err, cliente) {

      if (err) {
          return res.serverError(err);
      }

      var _customer = cliente.customer_conekta;

      if(_customer){
        return res.ok({ tarjetas:_customer.payment_sources.data,formaPagoSel:cliente.formaPagoSel});
      }

      return res.ok({ tarjetas:[],formaPagoSel:cliente.formaPagoSel});

    });


  }

};
