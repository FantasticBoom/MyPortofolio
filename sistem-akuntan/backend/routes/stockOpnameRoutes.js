const express = require("express");
const { body } = require("express-validator");
const stockOpnameController = require("../controllers/stockOpnameController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all (supports ?period_id=...)
router.get("/", stockOpnameController.getAll);

// Get summary
router.get("/summary", stockOpnameController.getSummary);

// Search Items (Autocomplete) - TEMPATKAN SEBELUM /:id
router.get("/search-items", stockOpnameController.searchItems);

// Get by ID
router.get("/:id", stockOpnameController.getById);

// Create
router.post(
  "/",
  [
    body("nama_item").notEmpty().withMessage("Nama item harus diisi"),
    body("stock_fisik").isInt().withMessage("Stock fisik harus berupa angka"),
    body("stock_kartu").isInt().withMessage("Stock kartu harus berupa angka"),
  ],
  validateInput,
  stockOpnameController.create
);

// Update
router.put(
  "/:id",
  [
    body("nama_item").notEmpty().withMessage("Nama item harus diisi"),
    body("stock_fisik").isInt().withMessage("Stock fisik harus berupa angka"),
    body("stock_kartu").isInt().withMessage("Stock kartu harus berupa angka"),
  ],
  validateInput,
  stockOpnameController.update
);

// Delete
router.delete("/:id", stockOpnameController.delete);

module.exports = router;
