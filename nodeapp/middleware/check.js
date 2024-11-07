// const checkAndSetUserId = (req, res, next) => {
//     if (req.isAuthenticated() && req.user && req.user.id) {
//         // Set user ID in session storage
//         req.session.userId = req.user.id;
//     }
//     next();
// };
const jwt = require('jsonwebtoken');
require('dotenv').config()

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            req.user = decoded;
            return next();
        });
    } else if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = isAuthenticated;

