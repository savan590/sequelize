const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('your_database', 'your_user', 'your_password', {
//   host: 'your_host',
//   dialect: 'postgres',
//   logging: false,
// });
const sequelize = new Sequelize('postgres://postgres:9443@localhost:5432/users', { logging: false })


module.exports = sequelize;