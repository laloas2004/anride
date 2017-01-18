var GoogleMapsAPI = require('googlemaps');
var Q = require('q');
module.exports = {
	publicConfig: {
		key: 'AIzaSyAirbsMhJwXqxtFjWQXUMg_jZXDrQn76O8',
		stagger_time: 1000, // for elevationPath
		encode_polylines: false,
		secure: true, // use https
		//proxy: 'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
	},
	prueba2: function () {
		return this.publicConfig;
	},
	getMatrix: function (location1, location2) {
		var loc1 = {
			lat: location1.lat,
			lon: location1.lon,
			toString: function () {
				return this.lat + ',' + this.lon;
			}
		};
		var loc2 = {
			lat: location2.lat,
			lon: location2.lon,
			toString: function () {
				return this.lat + ',' + this.lon;
			}
		};
		var paramsMatrix = {
			origins: loc1.toString(),
			destinations: loc2.toString(),
			mode: 'driving',
			traffic_model: 'pessimistic',
			departure_time: new Date(),
			units: 'metric'
		};
		var deferred = Q.defer()
		var gmAPI = new GoogleMapsAPI(this.publicConfig);
		gmAPI.distance(paramsMatrix, function (err, results) {
			if (err) {
				console.error(err);
				deferred.reject(new Error(err));
			}
			deferred.resolve(results);
		});
		return deferred.promise
	},
	getDireccion: function (location) {
		var deferred = Q.defer()
		if (!location) {
			deferred.reject(new Error('Se necesita un punto de coordenada'));
		}
		var latlng = location.latitude + ',' + location.longitud;
		//console.log(latlng);
		var gmAPI = new GoogleMapsAPI(this.publicConfig);
		var reverseGeocodeParams = {
			"latlng": latlng,
			//"result_type": "street_address",
			"language": "es",
			//"location_type": "APPROXIMATE"
		};
		gmAPI.reverseGeocode(reverseGeocodeParams, function (err, result) {
			if (err) {
				deferred.reject(new Error(err));
			}
			deferred.resolve(result);
		});
		return deferred.promise // the promise is returned
	}
};