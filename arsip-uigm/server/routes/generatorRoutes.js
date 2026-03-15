const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const verifyToken = require('../middleware/authMiddleware'); 

// Import Middleware Dinamis Anda
const uploadMiddleware = require('../middleware/uploadMiddleware');
const uploadSurat = uploadMiddleware('surat'); 

router.get('/number', verifyToken, generatorController.generateNumber);
router.post('/save', verifyToken, generatorController.saveSurat);
router.get('/history', verifyToken, generatorController.getHistory);
router.delete('/delete/:id', verifyToken, generatorController.deleteSurat);
router.post('/upload', verifyToken, uploadSurat.single('file_surat'), generatorController.uploadSurat);
router.post('/apply', verifyToken, generatorController.applyToArsip);


module.exports = router;