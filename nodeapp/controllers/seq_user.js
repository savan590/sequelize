const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../model/seq_model');
require('dotenv').config();
const path = require('path');

exports.login_user = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });

        if (user) {
            if (user.platform && user.platform_id) {
                return res.status(400).json({ success: false, error: `User is logged in with ${user.platform} platform` });
            }

            const hasPasswordMatched = await bcrypt.compare(password, user.password);

            if (hasPasswordMatched) {
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
                res.cookie('jwt', token, { httpOnly: true, secure: true });
                return res.json({ success: true, redirectUrl: 'home.html' });
            } else {
                return res.status(401).json({
                    success: false,
                    error: 'Incorrect credentials! Please try again',
                });
            }
        } else {
            return res.status(401).json({
                success: false,
                error: 'User does not exist',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.callback = async (req, res) => {
    try {
        const user = req.user;
        const userProfile = await User.findOne({ where: { email: user.email },attributes: ['pincode', 'age', 'phone', 'city'] });
        // console.log('---',userProfile)
        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!userProfile.pincode || !userProfile.age || !userProfile.phone || !userProfile.city) {
            res.redirect('/complete-profile.html');
            return;
        } else {
            const result = await User.findOne({ where: { platform_id: user.platform_id, platform: user.platform },attributes: ['email', 'platform', 'platform_id'] });
            if (result) {
                res.redirect('/home.html');
                return;
            } else {
                res.status(404).json({ error: 'User with this platform not found' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.complete_profile = (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '..', 'login', 'complete-profile.html'));
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

exports.fill_details = async (req, res) => {
    if (!req.isAuthenticated() || !req.cookies["connect.sid"]) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pincode, age, phone, city } = req.body;

    try {
        const email = req.user.email;
        // const hashedPassword = await bcrypt.hash(password, 10);

        await User.update(
            { pincode, age, phone, city },
            { where: { email } }
        );

        res.status(200).json({ success: true, message: "Completed profile data saved in Database" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.register = async (req, res) => {
    const { first_name, last_name, email, password, confirmPassword, pincode, age, phone, city } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            first_name, last_name, email, password: hashedPassword, pincode, age, phone, city
        });

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET);
        res.cookie('jwt', token, { httpOnly: true, secure: true });

        return res.json({ success: true, redirectUrl: '/complete-profile.html' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
};

exports.logout = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout(function (err) {
            if (err) { return next(err); }
        });

        res.clearCookie('connect.sid');
    } else {
        res.clearCookie('jwt');
    }
    res.redirect('/login.html');
};
