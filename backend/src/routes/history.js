const express = require('express');
const router = express.Router();

const {
  getMovementHistory
} = require('../controllers/inventoryController');

const { auth } = require('../middleware/auth');

router.get('/', auth, getMovementHistory);

module.exports = router;