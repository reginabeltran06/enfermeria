const express = require('express');
const router = express.Router();

const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines,
} = require('../controllers/medicinesController');

const { auth } = require('../middleware/auth');

router.get('/', auth, getAllMedicines);
router.get('/low-stock', auth, getLowStockMedicines);
router.get('/:id', auth, getMedicineById);
router.post('/', auth, createMedicine);
router.put('/:id', auth, updateMedicine);
router.delete('/:id', auth, deleteMedicine);

module.exports = router;