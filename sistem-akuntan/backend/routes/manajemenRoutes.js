const express = require("express");
const router = express.Router();
const manajemenController = require("../controllers/manajemenController");
const authMiddleware = require("../middleware/authMiddleware");

// --- SETUP UPLOAD FILE (MULTER) ---
const multer = require("multer");
const os = require("os");
const upload = multer({ dest: os.tmpdir() });

router.use(authMiddleware);

// --- USERS ---
router.get("/users", manajemenController.getAllUsers);
router.get("/profile/me", manajemenController.getCurrentUser);
router.put("/profile/update", manajemenController.updateProfile);
router.put("/password/change", manajemenController.changePassword);
router.get("/statistics", manajemenController.getStatistics);

// --- PERIODS ---
router.get("/periods", manajemenController.getPeriods);
router.post("/periods", manajemenController.createPeriod);
router.put("/periods/:id", manajemenController.updatePeriod);
router.delete("/periods/:id", manajemenController.deletePeriod);

// --- PRICES ---
router.get("/prices", manajemenController.getPrices);
router.post(
  "/prices/upload",
  upload.single("file"),
  manajemenController.uploadPrices
);

// --- CODINGS (PENGKODEAN) ---
router.get("/codings", manajemenController.getCodings);
router.post("/codings", manajemenController.createCoding);
router.put("/codings/:id", manajemenController.updateCoding);
router.delete("/codings/:id", manajemenController.deleteCoding);
router.post(
  "/codings/upload",
  upload.single("file"),
  manajemenController.uploadCodings
);

module.exports = router;
