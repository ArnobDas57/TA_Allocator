const config = require('config');
const jwt = require('jsonwebtoken');

// For restricted routes, look at /user route in routes/auth

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: "Unauthorized" })
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: "Token expired" })
    }
}

module.exports = auth;