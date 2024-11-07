// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const authenticate = (req, res, next) => {
//     const authHeader = req.header('Authorization');

//     if (!authHeader || !authHeader.startsWith('Bearer')) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const token = authHeader.substring(7); 
//     // console.log(token)
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.body.user = decoded.user; 
//         next();
//     } catch (error) {
//         console.error(error);
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

// module.exports = authenticate;

// passport.use( new GoogleStrategy(
//     {
//         clientID : process.env.CLIENT_ID,
//         clientSecret : process.env.CLIENT_SECRET,
//         callbackURL : process.env.GOOGLE_CALLBACK_URL,
//     },
//     (_, __, profile, done) => {
//         const account = profile._json;
//         console.log(account)
//     }
// ))

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const passport = require('passport');
require('dotenv').config();
const pool = require('../model/userModel');
// const checkAndSetUserId = require('../middleware/check')

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // const account = profile._json;
        // console.log(profile)
        const result = await pool.query('SELECT * FROM users WHERE platform_id = $1 and platform = $2', [profile.id, profile.provider]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);
        } else {
            const newUser = await pool.query(
                'INSERT INTO users (email, platform, platform_id, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [profile.emails[0].value, profile.provider, profile.id, profile.name.givenName, profile.name.familyName]
            );
            done(null, newUser.rows[0]);
        }
    } catch (error) {
        done(error, null);
    }
}));


passport.use(new MicrosoftStrategy({
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
    // console.log('-----------')
    try {
        // const account = profile._json;
        // console.log(profile)
        const result = await pool.query('SELECT * FROM users WHERE platform_id = $1 and platform = $2', [profile.id, profile.provider]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);
        } else {
            const newUser = await pool.query(
                'INSERT INTO users (email, platform, platform_id, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [profile.emails[0].value, profile.provider, profile.id, profile.name.givenName, profile.name.familyName]
            );
            done(null, newUser.rows[0]);
        }
    } catch (error) {
        done(error, null);
    }
}));

// passport.initialize();
// passport.session();
// passport.use(checkAndSetUserId);

module.exports = passport;


