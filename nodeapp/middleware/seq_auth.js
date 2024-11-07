const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const passport = require('passport');
require('dotenv').config();
const { User } = require('../model/seq_model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await User.findOne({ where: { id } })
        // console.log('result',result)
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
        const user = await User.findOne({
            where: {
                platform_id: profile.id,
                platform: profile.provider
            }
        });

        if (user) {
            done(null, user);
        } else {
            const newUser = await User.create({
                email: profile.emails[0].value,
                platform: profile.provider,
                platform_id: profile.id,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName
            });
            done(null, newUser);
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
    try {
        const user = await User.findOne({ where: { platform_id: profile.id, platform: profile.provider } });

        if (user) {
            done(null, user);
        } else {
            const newUser = await User.create({
                email: profile.emails[0].value,
                platform: profile.provider,
                platform_id: profile.id,
                first_name: profile.name.givenName,
                last_name: profile.name.familyName
            });

            done(null, newUser);
        }
    } catch (error) {
        done(error, null);
    }
}));

module.exports = passport;