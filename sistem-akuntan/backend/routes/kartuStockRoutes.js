const express = require("express");
const { body } = require("express-validator");
const kartuStockController = require("../controllers/kartuStockController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");

const router = express.Router();

router.use(authMiddleware);

// 1. Endpoint Kode List
router.get("/kode-list", kartuStockController.getKodeList);

// 2. Endpoint Cek Stok Terakhir (Untuk Masuk Barang Baru)
router.get("/last-stock", kartuStockController.getLastStock);

// 3. Endpoint Baru: Ambil Stok Tersedia per Harga (Untuk Keluar Barang)
router.get("/stock-batches", kartuStockController.getStockBatches);

// 4. Main Table
router.get("/", kartuStockController.getByKode);

// 5. Get by ID
router.get("/:id", kartuStockController.getById);

// 6. Create
router.post(
  "/",
  [
    body("kode").notEmpty().withMessage("Kode harus diisi"),
    body("tanggal").notEmpty().isISO8601().withMessage("Tanggal harus valid"),
    body("stock_awal").optional({ checkFalsy: true }).isNumeric(),
    body("masuk").optional({ checkFalsy: true }).isNumeric(),
    body("keluar").optional({ checkFalsy: true }).isNumeric(),
    body("harga_satuan").optional({ checkFalsy: true }).isNumeric(),
  ],
  validateInput,
  kartuStockController.create
);

// 7. Update
router.put(
  "/:id",
  [
    body("kode").notEmpty().withMessage("Kode harus diisi"),
    body("tanggal").notEmpty().isISO8601().withMessage("Tanggal harus valid"),
    body("stock_awal").optional({ checkFalsy: true }).isNumeric(),
    body("masuk").optional({ checkFalsy: true }).isNumeric(),
    body("keluar").optional({ checkFalsy: true }).isNumeric(),
    body("harga_satuan").optional({ checkFalsy: true }).isNumeric(),
  ],
  validateInput,
  kartuStockController.update
);

// 8. Delete
router.delete("/:id", kartuStockController.delete);

module.exports = router;
