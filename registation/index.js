const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./seq_db')

// const fileUpload = require('express-fileupload');

const apiRoutes = require('./routes/seq_user');
const app = express();

// app.use(express.static(path.join(__dirname, 'login')));

app.use(cors())

// app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.get("/", async (req, res) => {
    res.status(200).json("Server is up and running")
})

const PORT = 4002;
sequelize.sync()
    .then(() => {
        console.log('Database connected and synced');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });