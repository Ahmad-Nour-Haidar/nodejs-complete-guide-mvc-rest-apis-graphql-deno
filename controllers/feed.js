const {validationResult} = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200)
        .json({
            posts: [
                {
                    _id: '1',
                    title: 'First Post',
                    content: 'This is the first post!',
                    imageUrl: 'images/yellow.jpg',
                    creator: {
                        name: 'Ahmad'
                    },
                    createdAt: new Date(),
                }
            ],
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.stausCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/yellow.jpg',
        creator: {name: 'Ahmad'}
    });
    post
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
            });
        })
        .catch(err => {
            if (!err.stausCode) {
                err.stausCode = 500;
            }
            next(err);
        });
};
