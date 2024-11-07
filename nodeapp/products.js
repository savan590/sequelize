const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()
const pool = require('./model/userModel')
const  insertData  = require('./routes/createdata')
const app = express();

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/products-search', async (req, res) => {
    const client = await pool.connect();
    try {
        const { search, page = 1, limit = 10, sort = 'id', order = '' } = req.query;
        const pageNo = parseInt(page) ? page : 1;
        const limited = parseInt(limit) ? limit : 10;
        const offset = (pageNo - 1) * limit;
        // console.log('----',req.query)

        const sortBy = sort ? `p.${sort}` : 'p.id';
        let searchCondition = '';
        const values = [limited, offset];
        // const value = [];
        if (search) {
            searchCondition = `WHERE p.name ILIKE $3`;
            values.push(`%${search}%`);
        }

        const query = `SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.price AS product_price,
            (
                SELECT array_agg(url ORDER BY id)
                FROM images
                WHERE product_id = p.id
            ) AS product_images,(
              SELECT json_agg(
                          json_build_object(
                               'variant_id', v.id,
                               'variant_name', v.name,
                               'variant_description', v.description,
                               'variant_price', v.price,
                               'variant_stock', v.stock,
                               'variant_images', (
                                   SELECT i.url
                                   FROM images i
                                   WHERE i.id = v.image_id
                        ) 
                      ) order by v.id
                    )
                FROM variants v 
                    WHERE v.product_id = p.id
            ) AS variants
            FROM 
            products p
            ${searchCondition}
            ORDER BY ${sortBy} ${order}
             LIMIT $1 OFFSET $2;
            `
        // const q1 = query + `LIMIT $1 OFFSET $2;`
        const result = await pool.query(query, values); //

        res.json(result.rows);
    } catch (error) {
        console.error('Error in query', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

app.get("/", async (req, res) => {
    res.status(200).json("Server is up and running")
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/insert', async (req, res) => {
  try {
    await insertData();
    res.status(200).send('Data inserted successfully');
  } catch (error) {
    console.log(error)
    res.status(500).send('Error inserting data');
  }
});