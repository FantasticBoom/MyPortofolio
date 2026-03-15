const express = require('express');
const router = express.Router();
const skController = require('../controllers/skController');
const verifyToken = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Base URL: /api/sk
router.get('/', verifyToken, skController.getAllSK);
router.get('/:id', verifyToken, skController.getSKById);

// Upload masuk ke folder 'public/uploads/sk'
router.post('/', verifyToken, uploadMiddleware('sk').single('file'), skController.createSK);
router.put('/:id', verifyToken, uploadMiddleware('sk').single('file'), skController.updateSK);
router.delete('/:id', verifyToken, skController.deleteSK);

module.exports = router;