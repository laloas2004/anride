/**
 * PagoController
 *
 * @description :: Server-side logic for managing pagoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
conekta = require('conekta');

conekta.locale = 'es';
conekta.api_version = '2.0.0';


module.exports = {
    
  getFormasPago:function(req, res){
      
      
      if (!req.isSocket) {

            return res.badRequest();
        }
        
        
        
      
  },  
    
	
};

