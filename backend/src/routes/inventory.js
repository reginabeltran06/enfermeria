const express = require('express');
const router = express.Router();

const {
  recordEntry,
  recordExit,
  adjustStock,
  getMovementHistory,
  getInventoryReport,
  getStockSummary
} = require('../controllers/inventoryController');

const { auth } = require('../middleware/auth');

router.post('/entry', auth, recordEntry);

router.post('/exit', auth, recordExit);

router.post('/adjust', auth, adjustStock);

router.get('/history', auth, getMovementHistory);

router.get('/report', auth, getInventoryReport);

router.get('/summary', auth, getStockSummary);

module.exports = router;