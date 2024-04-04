const path = require('path');
const express = require('express');
const mongoose = require("mongoose");

const feedRoutes = require('./routes/feed');

const app = express();

app.use(express.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json
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

