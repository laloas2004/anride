

var Q = require('q');

var conekta = require('conekta');


module.exports = {
    createCostumer: function(_customer){

    var deferred = Q.defer();



    return deferred.promise;
    },
    createOrder: function( customer_id, price ) {

      console.log('customer_id');
      console.log(customer_id);
      console.log('price');
      console.log(price);

                  var deferred = Q.defer();

                  conekta.locale = 'es';
                  conekta.api_key = 'key_yFTwMZtTDNqmGZJML3mrEg';
                  conekta.api_version = '2.0.0';

                  conekta.Order.create({
                      "currency": "MXN",
                      "customer_info": {
                        "customer_id":customer_id
                      },
                      "line_items": [{
                        "name": "Viaje en Anride",
                        "unit_price": price,
                        "quantity": 1,
                        "antifraud_info": {
                                            "trip_id": "12345",
                                            "driver_id": "driv_1231",
                                            "ticket_class": "economic",
                                            "pickup_latlon": "23.4323456,-123.1234567",
                                            "dropoff_latlon": "23.4323456,-123.1234567"
                                          }
                      }],
                      "amount":price,
                      "shipping_lines":[{
                         "amount": 0
                      }],
                      "shipping_contact":{
                        "phone":'8110162454',
                        "reciver":'Jesus Abelardo',
                        "address":{
                          "street1":"Gonzalitos",
                          "postal_code":"66450",
                          "country":"Mexico",

                        }
                      },
                      "charges": [{
                        "amount":price,
                        "payment_method": {
                          "type": "default"
                        }
                      }]
              }, function(err, order) {

                    if(err){

                      deferred.reject(err);
                    }

                deferred.resolve(order);

              });

                  return deferred.promise;

    }

};
