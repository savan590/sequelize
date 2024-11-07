const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/check')
const pool = require('../model/userModel');
const { Op } = require('sequelize');
const { User } = require('../model/seq_model');

// const isAuthenticated = (req, res, next) => {
//     // console.log(req.isAuthenticated())
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.status(401).json({ error: 'Unauthorized' });
// };

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
        let m = 'SELECT email,first_name,last_name FROM users WHERE email ILIKE $1';
        const currentuser = await pool.query(m, [req.user.email])
        // console.log(currentuser.rows)
        res.json({ users: usersResult.rows, currentuser: currentuser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/user', requireAuth, async (req, res) => {
    const { search = '', page = 1, limit = 5 } = req.query;
    const pageNo = parseInt(page, 10) || 1;
    const limited = parseInt(limit, 10) || 5;
    const offset = (pageNo - 1) * limited;
    // const offset = (page - 1) * limit;

    try {
        const wherecondition = search ? {
            email: {
                [Op.iLike]: `%${search}%`
            }
        } : {};


        const { count, rows: users } = await User.findAndCountAll({
            where: wherecondition,
            attributes: ['email'],
            limit: limited,
            offset: offset,
        });

        const currentUser = await User.findOne({
            where: { email: req.user.email },
            attributes: ['email', 'first_name', 'last_name']
        });

        res.json({ totalusers: count, users, currentuser: currentUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;