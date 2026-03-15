const express = require('express');
const router = express.Router();
const arsipController = require('../controllers/arsipController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/jenis-surat', verifyToken, arsipController.getJenisSurat);
router.get('/jenis-sk', verifyToken, arsipController.getJenisSK);

// URL: /api/arsip
router.get('/', verifyToken, arsipController.searchArsip);

module.exports = router;