const { Pool } = require('pg'); 


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'user',
    password: '9443',
    port: '5432',
});

module.exports = pool;

