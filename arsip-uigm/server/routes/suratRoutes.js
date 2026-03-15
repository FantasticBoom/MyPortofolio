const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const verifyToken = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Get All & Detail
router.get('/', verifyToken, suratController.getAllSurat);
router.get('/:id', verifyToken, suratController.getSuratById);

// Create (Upload File)
router.post('/', verifyToken, uploadMiddleware('surat').single('file_surat'), suratController.createSurat);
router.put('/:id', verifyToken, uploadMiddleware('surat').single('file_surat'), suratController.updateSurat);

// Delete
router.delete('/:id', verifyToken, suratController.deleteSurat);

module.exports = router;