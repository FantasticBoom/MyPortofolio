const express = require("express");
const { body } = require("express-validator");
const penggunaanAnggaranController = require("../controllers/penggunaanAnggaranController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");

const router = express.Router();

router.use(authMiddleware);

// GET Master Data Periods
router.get("/periods", penggunaanAnggaranController.getAllPeriods);

// GET Summary
router.get("/summary", penggunaanAnggaranController.getSummary);

// GET Report by Period ID (untuk Sidebar)
router.get("/period/:periodId", penggunaanAnggaranController.getByPeriodId);

// CREATE / INIT
router.post(
  "/",
  [body("periode").notEmpty().withMessage("Periode harus diisi")],
  validateInput,
  penggunaanAnggaranController.create
);

// RINCIAN
router.post(
  "/rincian/add",
  [body("penggunaan_anggaran_id").isInt(), body("item").notEmpty()],
  validateInput,
  penggunaanAnggaranController.addRincian
);
router.put(
  "/rincian/:id",
  validateInput,
  penggunaanAnggaranController.updateRincian
);
router.delete("/rincian/:id", penggunaanAnggaranController.deleteRincian);

// KETERANGAN
router.post(
  "/keterangan/add",
  [body("penggunaan_anggaran_id").isInt(), body("item").notEmpty()],
  validateInput,
  penggunaanAnggaranController.addKeterangan
);
router.put(
  "/keterangan/:id",
  validateInput,
  penggunaanAnggaranController.updateKeterangan
);
router.delete("/keterangan/:id", penggunaanAnggaranController.deleteKeterangan);

module.exports = router;
