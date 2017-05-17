module.exports = function (req, res, next) {
    
    debugger;
    
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        return res.redirect('/login');
    }
};