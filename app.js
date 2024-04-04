const path = require('path');
const express = require('express');
const mongoose = require("mongoose");
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();

const feedRoutes = require('./routes/feed');

const app = express();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    }, filename: function (req, file, cb) {
        // const random = new Date().toISOString().replace(/[:.-]/g, '_') + '-' + Math.round(Math.random() * 1E9);
        const random = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = file.fieldname + '-' + random + '-' + file.originalname;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.urlencoded({extends: false})); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message: message});
});

const port = process.env.PORT || 8000;
const MONGODB_URI = 'mongodb://localhost/messages';
mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        // console.log(result);
        console.log('Connected to MongoDB...');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => console.log('Connected Failed to MongoDB', err));

