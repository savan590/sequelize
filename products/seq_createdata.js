const { Sequelize } = require('sequelize');
const sequelize = require('./seq');
const { Product } = require('./models/models');
const { Image } = require('./models/models');
const { Variant } = require('./models/models');

const insertData = async () => {
    const transaction = await sequelize.transaction();
    try {

        const products = [];
        for (let i = 1; i <= 500; i++) {
            products.push({
                name: `Product ${i}`,
                description: `Description for product ${i}`,
                price: (Math.random() * 100).toFixed(2)
            });
        }
        const insertedProducts = await Product.bulkCreate(products, { transaction });

        const images = [];
        for (const product of insertedProducts) {
            const imageCount = 1 + Math.floor(Math.random() * 7);
            for (let j = 1; j <= imageCount; j++) {
                images.push({
                    product_id: product.id,
                    url: `http://example.com/product_${product.id}_image_${j}.jpg`
                });
            }
        }
        const insertedImages = await Image.bulkCreate(images, { transaction });

        const variants = [];
        for (const product of insertedProducts) {
            const variantCount = 1 + Math.floor(Math.random() * 4);
            for (let k = 1; k <= variantCount; k++) {
                const image = insertedImages.filter(img => img.product_id === product.id)
                    .sort(() => 0.5 - Math.random())[0]; // Random image for the variant

                variants.push({
                    product_id: product.id,
                    name: `Variant ${k} of Product ${product.id}`,
                    description: `Description for variant ${k} of product ${product.id}`,
                    price: (Math.random() * 100).toFixed(2),
                    stock: Math.floor(Math.random() * 100),
                    image_id: image.id
                });
            }
        }
        await Variant.bulkCreate(variants, { transaction });

        await transaction.commit();
        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error inserting data:', error);
        await transaction.rollback();
    }
};

module.exports = insertData;
