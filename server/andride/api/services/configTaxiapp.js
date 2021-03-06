
var Q = require('q');
var fs = require('fs');
module.exports = {
    get: function() {
        var deferred = Q.defer();

        var obj;
        fs.readFile('./config/taxiapp.json', 'utf8', function(err, data) {

            if (err) {
                
                deferred.reject(new Error(err));
            }

            obj = JSON.parse(data);

            deferred.resolve(obj);

        });

        return deferred.promise;
    },
    save: function(json) {
        
        var deferred = Q.defer();
        var string = JSON.stringify(json);
        var file = fs.writeFileSync('./config/taxiapp.json', string, 'utf-8', function(err) {
            if (err) {
                
                deferred.reject(new Error(err));
            }
            
        });
        deferred.resolve(file);
        return deferred.promise;
    }


}