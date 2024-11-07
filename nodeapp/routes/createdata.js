const pool = require('../model/userModel')

const insertData = async () => {
    const client = await pool.connect();
    try {
        // Begin transaction
        await client.query('BEGIN');

        // Insert products
        await client.query(`
        DO $$
        BEGIN
            FOR i IN 1..500 LOOP
                INSERT INTO products (name, description, price)
                VALUES (
                    'Product ' || i,
                    'Description for product ' || i,
                    (RANDOM() * 100)::DECIMAL(10, 2)
                );
            END LOOP;
        END $$;
      `);

        // Insert images
        await client.query(`
        DO $$
        DECLARE
            prod_id INTEGER;
            img_count INTEGER;
        BEGIN
            FOR prod_id IN SELECT id FROM products LOOP
                -- Insert a random number of images (between 1 and 8) for each product
                FOR img_count IN 1..(1 + (RANDOM() * 7)::INTEGER) LOOP
                    INSERT INTO images (product_id, url)
                    VALUES (
                        prod_id,
                        'http://example.com/product_' || prod_id || '_image_' || img_count || '.jpg'
                    );
                END LOOP;
            END LOOP;
        END $$;
      `);

        // Insert variants
        await client.query(`
        DO $$
        DECLARE
            prod_id INTEGER;
            img_id INTEGER;
            var_count INTEGER;
        BEGIN
            FOR prod_id IN SELECT id FROM products LOOP
                -- Insert a random number of variants (between 1 and 5) for each product
                FOR var_count IN 1..(1 + (RANDOM() * 4)::INTEGER) LOOP
                    -- Select a random image_id for the variant from the product's images
                    SELECT id INTO img_id FROM images WHERE product_id = prod_id ORDER BY RANDOM() LIMIT 1;
                    
                    INSERT INTO variants (product_id, name, description, price, stock, image_id)
                    VALUES (
                        prod_id,
                        'Variant ' || var_count || ' of Product ' || prod_id,
                        'Description for variant ' || var_count || ' of product ' || prod_id,
                        (RANDOM() * 100)::DECIMAL(10, 2),
                        (RANDOM() * 100)::INTEGER,
                        img_id
                    );
                END LOOP;
            END LOOP;
        END $$;
      `);

        // Commit transaction
        await client.query('COMMIT');
        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error inserting data:', error);
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
};

module.exports = insertData;