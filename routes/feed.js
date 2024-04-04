const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

const {createEditPostValidator} = require('../util/validators/post-validator');
const isAuth = require('../middleware/is-auth');

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', isAuth, createEditPostValidator, feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, createEditPostValidator, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;