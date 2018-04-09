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
      
            conekta.locale = 'es';
            conekta.api_version = '2.0.0';
            conekta.api_key = "key_eYvWV7gSDkNYXsmr";
            
      
  },
  crearClienteConekta:function(req, res){
      
         if (!req.isSocket) {

            return res.badRequest();
        }
      
  },
  addFormaPagoConekta:function(req, res){
      
         if (!req.isSocket) {

            return res.badRequest();
        }
      
  }
    
	
};

