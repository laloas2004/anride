

var Q = require('q');

var conekta = require('conekta');


module.exports = {
    createCostumer: function(_customer){

    var deferred = Q.defer();

    configTaxiapp.get().then(function (config) {

      conekta.locale = 'es';
      conekta.api_key = config.conekta_key;
      conekta.api_version = '2.0.0';


    });

    return deferred.promise;
    },
    createOrder: function( customer_id, price, servicio_id, chofer_id, pickup_latlon, dropoff_latlon, cliente) {

                  var deferred = Q.defer();

                  configTaxiapp.get().then(function (config) {

                    conekta.locale = 'es';
                    conekta.api_key = config.conekta_key;
                    conekta.api_version = '2.0.0';
                    var pickup_latlon_str = " ";
                    var dropoff_latlon_str = " ";

                    var amount_centavos = price * 100;
                    var currency = "MXN";
                    var ticket_class = "estandar";

                    var street1 = "Gonzalitos";
                    var postal_code = "66450";
                    var country = "Mexico";

                    if(pickup_latlon){

                      pickup_latlon_str = pickup_latlon.lat+','+ pickup_latlon.lon;
                    }

                    if(dropoff_latlon){

                      var dropoff_latlon_str = dropoff_latlon.lat+','+dropoff_latlon.lon;
                    }

                    conekta.Order.create({
                        "currency":currency ,
                        "customer_info": {
                          "customer_id":customer_id
                        },
                        "line_items": [{
                          "name": "Viaje en Anride",
                          "unit_price": amount_centavos,
                          "quantity": 1,
                          "antifraud_info": {
                                        "trip_id": servicio_id,
                                        "driver_id": chofer_id,
                                        "ticket_class": ticket_class,
                                        "pickup_latlon": pickup_latlon_str,
                                        "dropoff_latlon": dropoff_latlon_str
                                            }
                        }],
                        "shipping_lines":[{
                           "amount": 0
                        }],
                        "shipping_contact":{
                          "phone": cliente.celNum,
                          "reciver":cliente.nombre+' '+ cliente.apellido,
                          "address":{
                            "street1":street1,
                            "postal_code":postal_code,
                            "country":country,

                          }
                        },
                        "charges": [{
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

                  });

                  return deferred.promise;

    }

};
