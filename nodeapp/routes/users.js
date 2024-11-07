const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../model/userModel');
const passport = require('../middleware/auth')
require('dotenv').config();
const path = require('path');
// const requireAuth = require('../middleware/auth');
const fs = require('fs')
const multer = require("multer");
// const upload = multer({ dest: 'upload/' });
const storage = multer.memoryStorage()
// const storage = multer.diskStorage({
//     destination: undefined,
// })
const upload = multer({ storage: storage })
const xlsx = require('xlsx');
// const upload =multer({storage : disk})

// router.get(
//     "/google",
//     passport.authenticate("google", {
//         scope: "profile",
//     })
// );
// router.get(
//     "/google/callback",
//     passport.authenticate("google", { session : true})
// );

// router.post('/register', async (req, res) => {
//     const { firstName, lastName, email, password, confirmPassword, pincode, age, phone, city } = req.body;

//     if (password !== confirmPassword) {
//         return res.status(400).json({ error: 'Passwords do not match' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     try {
//         const result = await pool.query(
//             'INSERT INTO users (first_name, last_name, email, password, pincode, age, phone, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
//             [firstName, lastName, email, hashedPassword, pincode, age, phone, city]
//         );
//         res.json(result.rows[0]);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Database error' });
//     }
// });

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get('/microsoft', passport.authenticate('microsoft', { session: false }));

// router.get("/google/callback",
//     passport.authenticate("google", { failureRedirect: '/login/failure' }),
//     (req, res) => {
//         res.redirect('/auth/complete-profile');
//     }
// );

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    async (req, res) => {
        try {
            const user = req.user;
            const query = 'SELECT pincode, age, phone, city FROM users WHERE email = $1';
            const Result = await pool.query(query, [user.email]);
            // console.log(Result)
            const userProfile = Result.rows[0];

            if (!userProfile.pincode || !userProfile.age || !userProfile.phone || !userProfile.city) {
                res.redirect('/auth/complete-profile');
            } else {
                res.redirect('/home.html');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.get('/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/auth/login' }),
    async (req, res) => {
        try {
            const user = req.user;
            const query = 'SELECT pincode, age, phone, city FROM users WHERE email = $1';
            const Result = await pool.query(query, [user.email]);
            // console.log(Result)
            const userProfile = Result.rows[0];

            if (!userProfile.pincode || !userProfile.age || !userProfile.phone || !userProfile.city) {
                res.redirect('/auth/complete-profile');
            } else {
                res.redirect('/home.html');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.get('/complete-profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '..', 'login', 'complete-profile.html'));
    } else {
        res.status(401).json({ error: 'Unauthorized' })
    }
});

router.post('/complete-profile', async (req, res) => {
    if (!req.isAuthenticated()) {
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
});

// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ success: false, error: 'Email and password are required' });
//         }

//         const userQuery = 'SELECT * FROM users WHERE email = $1';
//         const userResult = await pool.query(userQuery, [email]);

//         if (userResult.rows.length > 0) {
//             const user = userResult.rows[0];
//             const hasPasswordMatched = await bcrypt.compare(password, user.password);

//             if (hasPasswordMatched) {
//                 req.login(user, (err) => {
//                     if (err) {
//                         return res.status(500).json({ success: false, error: 'Internal Server Error' });
//                     }
//                     res.json({ success: true, redirectUrl: '/home.html' });
//                 });
//             } else {
//                 res.status(401).json({
//                     success: false,
//                     error: 'Incorrect credentials! Please try again',
//                 });
//             }
//         } else {
//             return res.status(401).json({
//                 success: false,
//                 error: 'User does not exist',
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// });

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
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
});

router.post('/register', async (req, res) => {
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
});

router.get('/logout', (req, res, next) => {
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
});


module.exports = router;



// res.redirect('/api/users')
// res.sendFile(path.join(__dirname, '..', 'login', 'home.html')); // Serve a form to complete profile


// router.post('/register', upload.single('file'), async (req, res) => {
//     try {
//         const { email, password, confirmPassword } = req.body;

//         if (!email || !password || !confirmPassword) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         if (password !== confirmPassword) {
//             return res.status(400).json({ error: 'Password and confirm password must match' });
//         }

//         const existingUserQuery = 'SELECT * FROM users WHERE email = $1';
//         const existingUserResult = await pool.query(existingUserQuery, [email]);

//         // console.log('....', existingUserResult.rows)

//         if (existingUserResult.rows.length > 0) {
//             return res.status(401).json({ error: 'Email is already registered' });
//         }

//         // use when express-uploadfile package use

//         // const file = req.files.file;
//         // const workbook = xlsx.read(file.data);
//         // const sheetName = workbook.SheetNames[0];
//         // const sheet = workbook.Sheets[sheetName];
//         // const data = xlsx.utils.sheet_to_json(sheet);

//         // Using memorystorage for not save file on local

//         const fileBuffer = req.file.buffer;
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//         // use when you have to store file in local
//         // const filePath = req.file.path;
//         // console.log('filepath----',filePath)

//         // const workbook = xlsx.readFile(filePath);
//         // console.log('workbook-----',workbook)

//         const sheetName = workbook.SheetNames[0];
//         // console.log('sheetname',sheetName)

//         const sheet = workbook.Sheets[sheetName];
//         // console.log('sheet--',sheet)

//         const data = xlsx.utils.sheet_to_json(sheet);
//         // console.log(data)

//         const expected = ['name', 'city', 'age'];
//         const headers = Object.keys(data[0]);
//         // console.log('===>', headers)

//         const missingColumns = expected.filter(col => !headers.includes(col));
//         const extraColumns = headers.filter(col => !expected.includes(col));

//         if (missingColumns.length > 0 || extraColumns.length > 0) {
//             // fs.unlinkSync(filePath); // Remove the uploaded file
//             return res.status(400).json({ error: 'Invalid columns in the Excel file', missingColumns, extraColumns });
//         }

//         const client = await pool.connect();
//         try {
//             const encryptedPassword = await bcrypt.hash(password, 10);

//             const insertUserQuery = 'INSERT INTO users (email, password) VALUES ($1, $2)';
//             await pool.query(insertUserQuery, [email, encryptedPassword]);
//             for (const row of data) {
//                 // const {name,city,age} = row
//                 await client.query('INSERT INTO clientdata (name, city, age) VALUES ($1, $2, $3)', [row.name, row.city, row.age]);
//             }

//         } catch (error) {
//             console.error(error);
//             return res.status(400).json({ success: false, error: 'something went wrong in uploading data into DB' });
//         } finally {
//             client.release();
//             // fs.unlinkSync(filePath); // Remove the uploaded file after processing
//         }
//         const token = jwt.sign({ email: email }, process.env.JWT_SECRET);

//         res.status(200).json({ success: true, token, user: email, message: 'file data uploaded successfully' });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// });

// router.post('/google/login', async (req, res, next) => {
//     passport.authenticate('local', async (err, user, info) => {
//         if (err) {
//             return res.status(500).json({ success: false, error: 'Internal Server Error' });
//         }
//         if (!user) {
//             return res.status(401).json({ success: false, error: 'Incorrect credentials! Please try again' });
//         }
//         req.logIn(user, (err) => {
//             if (err) {
//                 return res.status(500).json({ success: false, error: 'Internal Server Error' });
//             }
//             res.json({ success: true, user });
//         });
//     })(req, res, next);
// });

// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ success: false, error: 'Email and password are required' });
//         }

//         const userQuery = 'SELECT * FROM users WHERE email = $1';
//         const userResult = await pool.query(userQuery, [email]);
//         //console.log(userResult)

//         if (userResult.rows.length > 0) {
//             const user = userResult.rows[0];
//             const hasPasswordMatched = await bcrypt.compare(password, user.password);

//             if (hasPasswordMatched) {
//                 // const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
//                 res.json({ success: true, user });
//             } else {
//                 res.status(401).json({
//                     success: false,
//                     error: 'Incorrect credentials! Please try again',
//                 });
//             }
//         } else {
//             return res.status(401).json({
//                 success: false,
//                 error: 'User does not exist',
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// });







// router.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         const filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const data = xlsx.utils.sheet_to_json(sheet);

//         const client = await pool.connect();
//         try {
//             for (const row of data) {
//                 // const {name,city,age} = row
//                 // Assuming your Excel columns are 'Name', 'Email', 'Age'
//                 await client.query('INSERT INTO clientdata (name, city, age) VALUES ($1, $2, $3)',
//                     [row.name, row.city, row.age]);

//             }
//             res.json({ message: 'File uploaded and data stored successfully' });
//         } finally {
//             client.release();
//             fs.unlinkSync(filePath)// Remove the uploaded file after processing
//         }
//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// router.post('/upload', upload.single('xlsx'), (req, res) => {

//     const workbook = xlsx.readFile(req.file.path);

//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//     const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

//     const insertData = async () => {

//         const connection = await pool.getConnection();

//         try {

//             await connection.beginTransaction();

//             for (let row of data) {
//                 const [column1, column2, column3] = row; // Adjust this line based on your Excel structur
//                 await connection.query('INSERT INTO users(column1, column2, column3) VALUES(?, ?, ?)', [column1, column2, column3]);
//             }

//             await connection.commit();

//             res.send('Data uploaded successfully');

//         } catch (error) {
//             await connection.rollback();
//             res.status(500).send('Error occurred during data insertion');

//         } finally {
//             connection.release();
//         }

//     };

//     insertData();
// })


