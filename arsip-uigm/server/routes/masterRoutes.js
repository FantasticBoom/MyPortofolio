const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const verifyToken = require('../middleware/authMiddleware');
const pejabatController =require('../controllers/pejabatController');

// === ROUTES USERS ===
// URL: /api/master/users
router.get('/users', verifyToken, masterController.getAllUsers);
router.post('/users', verifyToken, masterController.createUser);
router.put('/users/:id', verifyToken, masterController.updateUser);
router.delete('/users/:id', verifyToken, masterController.deleteUser);

// === BAGIAN ===
router.get('/bagian', verifyToken, masterController.getAllBagian);
router.post('/bagian', verifyToken, masterController.createBagian);
router.put('/bagian/:id', verifyToken, masterController.updateBagian);
router.delete('/bagian/:id', verifyToken, masterController.deleteBagian);

// === TANDA TANGAN (TTD) ===
router.get('/ttd', verifyToken, masterController.getAllTTD);
router.post('/ttd', verifyToken, masterController.createTTD);
router.put('/ttd/:id', verifyToken, masterController.updateTTD);
router.delete('/ttd/:id', verifyToken, masterController.deleteTTD);

// === JENIS SURAT ===
router.get('/jenis-surat', verifyToken, masterController.getAllJenisSurat);
router.post('/jenis-surat', verifyToken, masterController.createJenisSurat);
router.put('/jenis-surat/:id', verifyToken, masterController.updateJenisSurat);
router.delete('/jenis-surat/:id', verifyToken, masterController.deleteJenisSurat);

// === JENIS SK ===
router.get('/jenis-sk', verifyToken, masterController.getAllJenisSK);
router.post('/jenis-sk', verifyToken, masterController.createJenisSK);
router.put('/jenis-sk/:id', verifyToken, masterController.updateJenisSK);
router.delete('/jenis-sk/:id', verifyToken, masterController.deleteJenisSK);

// === JENIS SURAT SUB ===
router.get('/jenis-surat-sub', verifyToken, masterController.getAllJenisSuratSub);
router.post('/jenis-surat-sub', verifyToken, masterController.createJenisSuratSub);
router.put('/jenis-surat-sub/:id', verifyToken, masterController.updateJenisSuratSub);
router.delete('/jenis-surat-sub/:id', verifyToken, masterController.deleteJenisSuratSub);

// === STRUKTURAL ===
router.get('/struktural', verifyToken, masterController.getAllStruktural);
router.post('/struktural', verifyToken, masterController.createStruktural);
router.put('/struktural/:id', verifyToken, masterController.updateStruktural);
router.delete('/struktural/:id', verifyToken, masterController.deleteStruktural);

// === ROUTES JENIS ===
// URL: /api/master/jenis
router.get('/jenis-surat', verifyToken, masterController.getAllJenisSurat);
router.get('/jenis-sk', verifyToken, masterController.getAllJenisSK);

module.exports = router;