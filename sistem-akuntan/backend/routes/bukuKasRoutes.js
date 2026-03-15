const express = require("express");
const { body } = require("express-validator");
const bukuKasController = require("../controllers/bukuKasController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// --- KONFIGURASI MULTER (UPLOAD FILE) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 50); // Batasi panjang nama

    const filename = `${uniqueSuffix}-${basename}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Format file tidak didukung. Gunakan JPG, PNG, PDF, atau DOC.")
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Hanya 1 file
  },
  fileFilter: fileFilter,
});

// All routes are protected
router.use(authMiddleware);

// Get Periods & Data
router.get("/periods", bukuKasController.getPeriods);

// ROUTE BARU: Autocomplete Item
router.get("/items/search", bukuKasController.searchItems);

router.get("/", bukuKasController.getAll);
router.get("/:id", bukuKasController.getById);

// Create dengan Multer Error Handling
router.post(
  "/",
  (req, res, next) => {
    upload.single("bukti_nota")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File terlalu besar. Maksimal 5MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  [
    body("tanggal").notEmpty().withMessage("Tanggal harus diisi"),
    body("uraian").notEmpty().withMessage("Uraian harus diisi"),
  ],
  validateInput,
  bukuKasController.create
);

// Update dengan Multer Error Handling
router.put(
  "/:id",
  (req, res, next) => {
    upload.single("bukti_nota")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File terlalu besar. Maksimal 5MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  [
    body("tanggal").notEmpty().withMessage("Tanggal harus diisi"),
    body("uraian").notEmpty().withMessage("Uraian harus diisi"),s
  ],
  validateInput,
  bukuKasController.update
);

// Delete
router.delete("/:id", bukuKasController.delete);

module.exports = router;
