const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

const {createEditPostValidator} = require('../util/validators/post-validator');
const isAuth = require('../middleware/is-auth');

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', createEditPostValidator, feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId', createEditPostValidator, feedController.updatePost);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;