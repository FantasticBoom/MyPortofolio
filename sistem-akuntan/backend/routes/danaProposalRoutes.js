const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const danaProposalController = require("../controllers/danaProposalController");
const authMiddleware = require("../middleware/authMiddleware");

// --- Multer Configuration ---
const uploadDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

router.use(authMiddleware);

// --- ROUTE ---
router.get("/list-periods", danaProposalController.getPeriodsList);

// Route existing
router.get("/:periode", danaProposalController.getByPeriode);

router.post(
  "/save",
  upload.fields([
    { name: "dokumen_pengajuan", maxCount: 1 },
    { name: "dokumen_penerimaan", maxCount: 1 },
  ]),
  danaProposalController.saveProposal
);

module.exports = router;
