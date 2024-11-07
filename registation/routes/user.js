const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const requireAuth = require('../auth')
// const path = require('path');
// const requireAuth = require('../middleware/auth');
// const fs = require('fs')
const multer = require("multer");
// const upload = multer({ dest: 'upload/' });
const storage = multer.memoryStorage()
// const storage = multer.diskStorage({
//     destination: undefined,
// })
const upload = multer({ storage: storage })
const xlsx = require('xlsx');


router.post('/register', upload.single('file'), async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Password and confirm password must match' });
        }

        const existingUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUserResult = await pool.query(existingUserQuery, [email]);

        // console.log('....', existingUserResult.rows)

        if (existingUserResult.rows.length > 0) {
            return res.status(401).json({ error: 'Email is already registered' });
        }

        // use when express-uploadfile package use

        // const file = req.files.file;
        // const workbook = xlsx.read(file.data);
        // const sheetName = workbook.SheetNames[0];
        // const sheet = workbook.Sheets[sheetName];
        // const data = xlsx.utils.sheet_to_json(sheet);

        // Using memorystorage for not save file on local

        const fileBuffer = req.file.buffer;
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

        // use when you have to store file in local
        // const filePath = req.file.path;
        // console.log('filepath----',filePath)

        // const workbook = xlsx.readFile(filePath);
        // console.log('workbook-----',workbook)

        const sheetName = workbook.SheetNames[0];
        // console.log('sheetname',sheetName)

        const sheet = workbook.Sheets[sheetName];
        // console.log('sheet--',sheet)

        const data = xlsx.utils.sheet_to_json(sheet);
        // console.log(data)

        const expected = ['name', 'city', 'age'];
        const headers = Object.keys(data[0]);
        // console.log('===>', headers)

        const missingColumns = expected.filter(col => !headers.includes(col));
        const extraColumns = headers.filter(col => !expected.includes(col));

        if (missingColumns.length > 0 || extraColumns.length > 0) {
            // fs.unlinkSync(filePath); // Remove the uploaded file
            return res.status(400).json({ error: 'Invalid columns in the Excel file', missingColumns, extraColumns });
        }

        const client = await pool.connect();
        try {
            const encryptedPassword = await bcrypt.hash(password, 10);

            const insertUserQuery = 'INSERT INTO users (email, password) VALUES ($1, $2)';
            await pool.query(insertUserQuery, [email, encryptedPassword]);
            for (const row of data) {
                // const {name,city,age} = row
                await client.query('INSERT INTO clientdata (name, city, age) VALUES ($1, $2, $3)', [row.name, row.city, row.age]);
            }

        } catch (error) {
            console.error(error);
            return res.status(400).json({ success: false, error: 'something went wrong in uploading data into DB' });
        } finally {
            client.release();
            // fs.unlinkSync(filePath); // Remove the uploaded file after processing
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

        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);
        //console.log(userResult)

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
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
    // console.log("->>>>>>>>>>>>", req.query)

    const offset = (page - 1) * limit;
    // console.log(req.user)
    try {
        let query = 'SELECT email FROM users';
        const values = [];
        // const emails = await pool.query(query);
        // console.log('11111',emails.rows)
        if (search) {
            query += ' WHERE email ILIKE $1';
            values.push(`%${search}%`);
            // console.log('val',values.push(`%${search}%`));
        }

        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const usersResult = await pool.query(query, values);
        // console.log('-----', query)
        let m = 'SELECT email FROM users WHERE email ILIKE $1';
        const currentuser = await pool.query(m, [req.user.email])
        // console.log(currentuser.rows)
        res.json({ users: usersResult.rows, currentuser: currentuser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;