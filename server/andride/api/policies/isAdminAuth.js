module.exports = function (req, res, next) {

    if (!req.isSocket) {
        
        if (req.isAuthenticated()) {

            return next();
        }
        else {
            return res.redirect('/login');
        }


    } else {
        return next();
    }

};