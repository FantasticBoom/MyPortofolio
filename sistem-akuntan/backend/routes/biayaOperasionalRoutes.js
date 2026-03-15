const express = require("express");
const { body } = require("express-validator");
const biayaOperasionalController = require("../controllers/biayaOperasionalController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");

const router = express.Router();

router.use(authMiddleware);

// Get all
router.get("/", biayaOperasionalController.getAll);

// Get periods
router.get("/periods", biayaOperasionalController.getPeriods);

// Get summary
router.get("/summary/periode", biayaOperasionalController.getSummaryByPeriode);

// --- SEARCH ROUTE (Posisi penting: Sebelum /:id) ---
router.get(
  "/search-barang",
  biayaOperasionalController.searchBarangOperasional
);

// Get Single ID
router.get("/:id", biayaOperasionalController.getById);

// Create
router.post(
  "/",
  [
    body("periode_id").notEmpty().withMessage("Periode harus dipilih"),
    body("tanggal").notEmpty().isISO8601().withMessage("Tanggal harus valid"),
    body("jenis_biaya")
      .notEmpty()
      .isIn(["biaya_sewa", "biaya_operasional", "biaya_bahan_baku"])
      .withMessage("Jenis biaya tidak valid"),
    body("uraian").notEmpty().withMessage("Uraian harus diisi"),
  ],
  validateInput,
  biayaOperasionalController.create
);

// Update
router.put(
  "/:id",
  [
    body("periode_id").notEmpty().withMessage("Periode harus dipilih"),
    body("tanggal").notEmpty().isISO8601().withMessage("Tanggal harus valid"),
    body("jenis_biaya")
      .notEmpty()
      .isIn(["biaya_sewa", "biaya_operasional", "biaya_bahan_baku"])
      .withMessage("Jenis biaya tidak valid"),
    body("uraian").notEmpty().withMessage("Uraian harus diisi"),
  ],
  validateInput,
  biayaOperasionalController.update
);

router.delete("/:id", biayaOperasionalController.delete);

module.exports = router;
