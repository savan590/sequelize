const { DataTypes } = require('sequelize');
const sequelize = require('./seq_db');

const User = sequelize.define('user', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { timestamps: false });


const ClientData = sequelize.define('clientdata', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},{ timestamps: false });

module.exports = { ClientData, User };
