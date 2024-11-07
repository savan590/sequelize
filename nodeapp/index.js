const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()
const pool = require('./model/userModel')
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);
// const fileUpload = require('express-fileupload');
require('./middleware/auth')
const path = require('path');
const { insertData } = require('./routes/createdata')
const authRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/apiroutes');
const app = express();
const { sequelize } = require('./model/seq_model')
app.use(cookieParser())
// app.use('/static', express.static(path.join(__dirname, 'login')));
app.use(express.static(path.join(__dirname, 'login')));

// app.use(session({
//   secret: 'rush',
//   resave: false,
//   saveUninitialized: true
// }));

app.use(session({
  // store: new pgSession({
  //     pool: pool,                // Connection pool
  //     tableName: 'users'       // Use another table-name than the default "session" one
  // }),
  secret: 'rush',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: false }     // Note: Set 'secure' to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
// const corsOptions = {
//   origin: 'http://localhost:3001', // Replace with your frontend URL
//   credentials: true
// };
app.use(cors())

// app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

const syncDB = async () => {
  try {
      await sequelize.sync(); // Set to false if you don't want to drop tables
      console.log('Database synchronized');
  } catch (error) {
      console.error('Error syncing database:', error);
  }
};

syncDB();
// console.log("++++")
app.use('/auth', authRoutes);
app.use('/api', apiRoutes)

// console.log('----')
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.get("/", async (req, res) => {
  res.status(200).json("Server is up and running")
})


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // mongoose
  //   .connect(process.env.MONGODB_URL)
  //   .then(() => console.log("Database connected successfully"))
  //   .catch(error => console.error(error))
});

//SELECT variant_id, url
// FROM images
// WHERE id IN (
//     SELECT MIN(id)
//     FROM images
//     WHERE variant_id IS NOT NULL
//     GROUP BY variant_id
// )
// ORDER BY id 

//count
// const count1 = `SELECT COUNT(*) FROM ${query} AS count;`
    // const count = await pool.query(count1, values);
    // console.log('--', count)