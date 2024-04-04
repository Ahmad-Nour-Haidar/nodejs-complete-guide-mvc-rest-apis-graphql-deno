const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

const {createPostValidator} = require('../util/validators/post-validator');

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', createPostValidator, feedController.createPost);

module.exports = router;