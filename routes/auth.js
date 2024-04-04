const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth')
const {signupValidator} = require('../util/validators/auth-validator')

router.put('/signup', signupValidator, authController.signup);

module.exports = router;
