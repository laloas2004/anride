
var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
        email: {
            type: 'email',
            required: true,
            unique: true
        },
        password: {
            type: 'string',
            required: true
        },
        rol: {
            type: 'string',
            defaultsTo: 'operador',
            enum: ['admin', 'operador','delegado'],
        }
    },
    toJSON: function () {
        var obj = this.toObject();
        delete obj.password;
        return obj;
    },
    attemptLogin: function (inputs, cb) {
        // Create a user
        User.findOne({
            email: inputs.email,
            // TODO: But encrypt the password first
            password: inputs.password
        })
                .exec(cb);
    },
    beforeCreate: function (user, cb) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    }

};