const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../db');
require('dotenv').config();
const requireAuth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Password and confirm password must match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = new User({ email, password: encryptedPassword });
        await user.save();

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);

        res.json({ success: true, token, user: email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (user) {
            let hasPasswordMatched = await bcrypt.compare(password, user.password);
            if (hasPasswordMatched) {
                // const jwttoken = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
                const jwttoken = jwt.sign({email: user.email}, process.env.JWT_SECRET);
                const id = user._id
                // console.log(id)
                res.json({ success: true, jwttoken, id});
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Incorrect credentials! Please try again'
                });
            }
        } else {
            res.status(401).json({
                success: false,
                error: 'User does not exist'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/users', requireAuth, async (req, res) => {
    try {
        const users = await User.find({}, 'email');
        // const emails = users.map(user => user.email);
        // res.json({ users: emails });
        res.json({ users: users.map(user => user.email) });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
