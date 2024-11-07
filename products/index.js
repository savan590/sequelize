const express = require('express');
const { Op } = require('sequelize');
const { Product, Image, Variant } = require('./models/models');
const { sequelize } = require('./models/models')
const insertData = require('./seq_createdata');
const app = express();
const port = 3005;

app.use(express.json());

const syncDB = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDB();

app.get('/products-search', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sort = 'id', order = 'ASC' } = req.query;
    const pageNo = parseInt(page, 10) || 1;
    const limited = parseInt(limit, 10) || 10;
    const offset = (pageNo - 1) * limited;

    const whereCondition = search ? { name: { [Op.iLike]: `%${search}%` } } : {};
    // const product1 = await Product.findAll({
    //   attributes: ['name', 'price'],
    //   include: [
    //     {
    //       model: Image,
    //       attributes: ['url'],
    //       as: 'Images',
    //       order: [['id']]
    //     },
    //     {
    //       model: Variant,
    //       attributes: ['id', 'stock', 'price'],
    //       // as : 'variants',
    //       separate : true,
    //       // required : false,
    //       order : [['id','ASC']]
    //     },
    //   ]
    // });
    // const product = await Variant.findAll({
    //   attributes: ['stock', 'price'],
    //   include: [
    //     {
    //       model: Image,
    //       attributes: ['url'],
    //       // as: 'Images',
    //       order: [['id']]
    //     },
    //     {
    //       model: Product,
    //       attributes: ['id', 'name', 'price'],
    //       // as : 'variants',
    //       // separate : true,
    //       // required : false,
    //       order : [['id','ASC']]
    //     },
    //   ]
    // });

    const products = await Product.findAll({
      where: whereCondition,
      include: [
        {
          model: Image,
          attributes: ['url'],
          as: 'Images',
        },
        {
          model: Variant,
          attributes: ['id', 'name', 'description', 'price', 'stock'],
          as: 'Variants',
          include: [
            {
              model: Image,
              attributes: ['url'],
              as: 'Image',
            },
          ],
          order: [['id', 'ASC']],
          separate: true,
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: limited,
      offset: offset,
    });
    res.json(products);
  } catch (error) {
    console.error('Error in query', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/create', async (req, res) => {
  try {
    await insertData();
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.log('--', error)
    res.status(500).json({ error: 'Error inserting data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
