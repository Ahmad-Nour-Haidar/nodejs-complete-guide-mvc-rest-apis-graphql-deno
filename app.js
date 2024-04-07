const path = require('path');

const express = require('express');
const mongoose = require("mongoose");
const multer = require('multer');
require('dotenv').config();
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file');

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

// app.use(bodyParser.urlencoded({extends: false})); // x-www-form-urlencoded <form>
// app.use(bodyParser.json()); // application/json
app.use(express.urlencoded()); // x-www-form-urlencoded <form>
app.use(express.json()); // application/json
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(auth);

app.put('/post-image', (req, res, next) => {
    if (!req.isAuth) {
        throw new Error('Not authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({message: 'No file provided!'});
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(201)
        .json({
            message: 'File stored.',
            filePath: req.file.path,
        });
});

app.use('/graphql', graphqlHttp.graphqlHTTP({
    schema: graphqlSchema, rootValue: graphqlResolver, graphiql: true, customFormatErrorFn(error) {
        if (!error.originalError) {
            return error;
        }
        const data = error.originalError.data;
        const message = error.message || 'An error occurred.'
        const code = error.originalError.code || 500;
        return {
            message: message, status: code, data: data,
        };
    }
}));

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

const port = process.env.PORT || 8000;
const MONGODB_URI = 'mongodb://localhost/messages';
mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        // console.log(result);
        console.log('Connected to MongoDB...');
        app.listen(port, "0.0.0.0", () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => console.log('Connected Failed to MongoDB', err));

// I connect Socket.IO with Flutter,
// Flutter: github repo: https://github.com/Ahmad-Nour-Haidar/shorts-tutorial/blob/main/lib/core/socket_io/socket_io_connect.dart

