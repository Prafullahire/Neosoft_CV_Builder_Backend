const express = require('express');
const router = express.Router();
const { registerUser, authUser, googleAuth } = require('../controllers/authController');
const { validateRegister, validateLogin, validateGoogleAuth } = require('../middleware/validation');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/google', validateGoogleAuth, googleAuth);


module.exports = router;
