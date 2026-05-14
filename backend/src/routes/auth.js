const express = require('express');
const router = express.Router();

const {
  login,
  register,
  verifyToken
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');

router.post('/login', login);

router.post('/register', register);

router.get('/verify', auth, verifyToken);

module.exports = router;