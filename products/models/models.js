const { DataTypes } = require('sequelize');
const sequelize = require('../seq');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue('name') +' '+ 'XYZ';
        }
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: false,
    tableName: 'products',
});



const Image = sequelize.define('Image', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
        },
    },
}, {
    timestamps: false,
    tableName: 'images',
});



const Variant = sequelize.define('Variant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
        },
    },
    image_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Image,
            key: 'id',
        },
    },
}, {
    timestamps: false,
    tableName: 'variants',
});

Product.hasMany(Image, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
});

Product.hasMany(Variant, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE',
});

Variant.belongsTo(Product, {
    foreignKey: 'product_id'
});

Image.belongsTo(Product, {
    foreignKey: 'product_id'
});

Variant.belongsTo(Image, {
    foreignKey: 'image_id',
});

Image.hasMany(Variant, {
    foreignKey: 'image_id'
});


module.exports = { sequelize, Product, Image, Variant };
