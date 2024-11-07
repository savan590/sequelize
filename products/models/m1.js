const { DataTypes } = require('sequelize');
const sequelize = require('./path/to/your/sequelize/instance');

const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL(10, 2),
}, {
    tableName: 'products',
    timestamps: false,
});
const Image = sequelize.define('Image', {
    url: DataTypes.STRING,
}, {
    tableName: 'images',
    timestamps: false,
});
const Variant = sequelize.define('Variant', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL(10, 2),
    stock: DataTypes.INTEGER,
    image_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'images',
            key: 'id',
        },
    },
}, {
    tableName: 'variants',
    timestamps: false,
});
module.exports = Product;
