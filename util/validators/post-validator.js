const {body} = require('express-validator');

exports.createPostValidator = [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5}),
];