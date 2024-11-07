const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');
const { User, ClientData } = require('../model')
const requireAuth = require('../auth');
const { Op } = require('sequelize');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('file'), async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Password and confirm password must match' });
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(401).json({ error: 'Email is already registered' });
        }

        const fileBuffer = req.file.buffer;
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const expected = ['name', 'city', 'age'];
        const headers = Object.keys(data[0]);

        const missingColumns = expected.filter(col => !headers.includes(col));
        const extraColumns = headers.filter(col => !expected.includes(col));

        if (missingColumns.length > 0 || extraColumns.length > 0) {
            return res.status(400).json({ error: 'Invalid columns in the Excel file', missingColumns, extraColumns });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.create({ email, password: encryptedPassword });

        for (const row of data) {
            await ClientData.create({
                name: row.name,
                city: row.city,
                age: row.age,
            });
        }

        const token = jwt.sign({ email: email }, 'savan');
        res.status(200).json({ success: true, token, user: email, message: 'file data uploaded successfully' });

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

        const user = await User.findOne({ where: { email } });

        if (user) {
            const hasPasswordMatched = await bcrypt.compare(password, user.password);

            if (hasPasswordMatched) {
                const token = jwt.sign({ email: user.email }, 'savan');
                res.json({ success: true, user, token });
            } else {
                res.status(401).json({
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
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/users', requireAuth, async (req, res) => {
    const { search = '', page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const queryOptions = {
            limit: parseInt(limit),
            offset,
        };

        // if (search) {
        //     queryOptions.where = {
        //         email: {
        //             [Op.iLike]: search ? `%${search}%` : '',
        //         },
        //     };
        // }

        const wherecondition = search ? {
            email: {
                [Op.iLike]: `%${search}%`
            }
        } : {};

        const { count, rows: users } = await User.findAndCountAll({
            where: wherecondition,
            queryOptions
        });
        // console.log("---",req.user)
        const currentuser = await User.findOne({
            where: { email: req.user.email },
            attributes: ['email'],
        });

        res.json({ totalusers: count, users, currentuser: currentuser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
