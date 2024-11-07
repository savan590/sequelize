const express = require('express');
const router = express.Router();
const passport = require('../middleware/seq_auth')
// const userController = require('../controllers/user')
const userController1 = require('../controllers/seq_user')


// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// router.get('/microsoft', passport.authenticate('microsoft', { session: false }));

// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), userController.callback);
// router.get('/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/auth/login' }), userController.callback);
// router.get('/complete-profile', userController.complete_profile)
//     .post('/complete-profile', userController.fill_details)
//     .post('/login', userController.login_user)
//     .post('/register', userController.register)
//     .get('/logout', userController.logout)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/microsoft', passport.authenticate('microsoft', { session: false }));
    
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), userController1.callback);
router.get('/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/auth/login' }), userController1.callback);
router.get('/complete-profile', userController1.complete_profile)
        .post('/complete-profile', userController1.fill_details)
        .post('/login', userController1.login_user)
        .post('/register', userController1.register)
        .get('/logout', userController1.logout)
    

module.exports = router;