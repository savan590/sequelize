
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });

const User = sequelize.define('user', {
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    age: { type: DataTypes.INTEGER },
    phone: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    platform: { type: DataTypes.STRING },
    platform_id: { type: DataTypes.STRING }
}, { timestamps: false });

module.exports = { User, sequelize };
