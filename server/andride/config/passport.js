
var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        bcrypt = require('bcrypt');


//passport.serializeChofer(function(chofer, done) {
//    done(null, chofer.id);
//});
//
//passport.deserializeChofer(function(id, done) {
//
//    Chofer.findOne({id: id}, function(err, chofer) {
//        done(err, chofer);
//    });
//});
//
//passport.use(new LocalStrategy({
//    usernameField: 'email',
//    passwordField: 'password'
//}, function(email, password, done) {
//
//    User.findOne({email: email}, function(err, user) {
//        if (err) {
//            return done(err);
//        }
//        if (!user) {
//            return done(null, false, {message: 'Incorrect email.'});
//        }
//
//        bcrypt.compare(password, user.password, function(err, res) {
//            if (!res)
//                return done(null, false, {
//                    message: 'Invalid Password'
//                });
//            var returnUser = {
//                email: user.email,
//                createdAt: user.createdAt,
//                id: user.id
//            };
//            return done(null, returnUser, {
//                message: 'Logged In Successfully'
//            });
//        });
//    });
//}));
