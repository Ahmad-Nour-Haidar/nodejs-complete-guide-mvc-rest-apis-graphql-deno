const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find().skip((currentPage - 1) * perPage).limit(perPage);
        res.status(200)
            .json({
                message: 'Fetched posts successfully.',
                posts: posts,
                totalItems: totalItems,
            });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.createPost = async (req, res, next) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        if (!req.file) {
            const error = new Error('No image provided.');
            error.statusCode = 422;
            throw error;
        }
        const imageUrl = req.file.path;
        const title = req.body.title;
        const content = req.body.content;
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }
        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId,
        });
        let result = await post.save();
        if (!result) {
            const error = new Error('Post creation unsuccessful');
            error.statusCode = 500;
            throw error;
        }
        user.posts.push(post);
        result = await user.save();
        if (result) {
            res.status(201)
                .json({
                    message: 'Post created successfully!',
                    post: post,
                    // creator: user,
                });
            io.getIO().emit('posts', {
                action: 'create',
                post: post,
            });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched.',
            post: post,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        const postId = req.params.postId;
        const title = req.body.title;
        const content = req.body.content;
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!, can not edit.');
            error.statusCode = 403;
            throw error;
        }
        let imageUrl = post.imageUrl;
        if (req.file) {
            imageUrl = req.file.path;
            clearImage(post.imageUrl);
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const result = await post.save();
        res.status(200)
            .json({
                message: 'Post updated!',
                post: result,
            });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!, can not edit');
            error.statusCode = 403;
            throw error;
        }
        const imageUrl = post.imageUrl;
        await Post.findOneAndDelete(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        const result = await user.save();
        if (result) {
            clearImage(imageUrl);
            res.status(200)
                .json({
                    message: 'Deleted post.',
                });
        } else {
            res.status(422)
                .json({
                    message: 'Something went wrong, post deletion failed!',
                });
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    // console.log("filePath = ", filePath);
    fs.unlink(filePath, error => console.log(error));
};
