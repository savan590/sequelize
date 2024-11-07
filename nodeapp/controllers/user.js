const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../model/userModel');
require('dotenv').config();
const path = require('path');


exports.login_user = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            if (user.platform && user.platform_id) {
                return res.status(400).json({ success: false, error: `user is login with ${user.platform} platform` })
            }

            const hasPasswordMatched = await bcrypt.compare(password, user.password);

            if (hasPasswordMatched) {
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('jwt', token, { httpOnly: true, secure: true });
                return res.json({ success: true, redirectUrl: '/home.html' });
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
        // console.log(req.user)
        const query = 'SELECT pincode, age, phone, city FROM users WHERE email = $1';
        const Result = await pool.query(query, [user.email]);
        // console.log(Result)
        const userProfile = Result.rows[0];

        if (!userProfile.pincode || !userProfile.age || !userProfile.phone || !userProfile.city) {
            res.redirect('/complete-profile.html');
            return;
        } else {
            const result = await pool.query('SELECT email,platform,platform_id FROM users WHERE platform_id = $1 and platform = $2', [req.user.platform_id, req.user.platform])
            if (result.rows[0]) {
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
        res.status(401).json({ error: 'Unauthorized' })
    }
};

exports.fill_details = async (req, res) => {
    if (!req.isAuthenticated() || !req.cookies["connect.sid"]) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pincode, age, phone, city, password } = req.body;

    try {
        let email = '';
        // console.log('----',req.user)
        if (req.user && req.user.email && req.user.email.length > 0) {
            email = req.user.email;
        } else {
            throw new Error('User email not found or invalid format');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'UPDATE users SET pincode=$1, age=$2, phone=$3, city=$4, password=$5 WHERE email=$6',
            [pincode, age, phone, city, hashedPassword, email]
        );
        res.status(200).json({ success: true, message: " completed profile data saved in Database" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.register = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, pincode, age, phone, city } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUserQuery = 'SELECT * FROM users WHERE email = $1';
    const existingUserResult = await pool.query(existingUserQuery, [email]);

    // console.log('....', existingUserResult.rows)

    if (existingUserResult.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, pincode, age, phone, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [firstName, lastName, email, hashedPassword, pincode, age, phone, city]
        );

        const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwt', token, { httpOnly: true, secure: true });

        return res.json({ success: true, redirectUrl: '/complete-profile.html' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
};

exports.logout = (req, res, next) => {
    // req.logout();
    if (req.isAuthenticated()) {
        req.logout(function (err) {
            if (err) { return next(err); }
            // res.redirect('/login.html');
        });

        res.clearCookie('connect.sid');
    }
    else {
        res.clearCookie('jwt')
    }
    res.redirect('/login.html');
}

