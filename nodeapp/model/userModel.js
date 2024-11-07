const { Pool } = require('pg'); 
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;


//config.js
// const Pool = require("pg").Pool;
// const dotenv = require("dotenv");
// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

// pool.on("connect", () => {
//   console.log("connected to the db");
// });

// module.exports = {
//   pool
// };
