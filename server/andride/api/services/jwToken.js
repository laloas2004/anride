
var jwt = require('jsonwebtoken'),
        tokenSecret = "secretissecet";


module.exports.issue = function(payload) {

    return jwt.sign(
            payload,
            tokenSecret, // Token Secret that we sign it with
            {
                expiresIn: 1800000 // Token Expire time
            }
    );
};

// Verifies token on a request
module.exports.verify = function(token, callback) {
    return jwt.verify(
            token, // The token to be verified
            tokenSecret, // Same token we used to sign
            {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
            callback //Pass errors or decoded token to callback
            );
};
