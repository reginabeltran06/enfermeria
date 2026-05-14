const express = require('express');
const router = express.Router();

const {
  getActiveAlerts,
  getLowStockAlerts,
  acknowledgeAlert,
  generateAlerts,
  getAlertsSummary
} = require('../controllers/alertsController');

const { auth } = require('../middleware/auth');

router.get('/', auth, getActiveAlerts);

router.get('/low-stock', auth, getLowStockAlerts);

router.get('/summary', auth, getAlertsSummary);

router.post('/generate', auth, generateAlerts);

router.patch('/:id/read', auth, acknowledgeAlert);

module.exports = router;