const express = require("express");
const authRoutes = require("./authRoutes");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.use("/auth", authRoutes);

// Protected Routes
router.use("/dashboard", authMiddleware, require("./dashboardRoutes"));
router.use("/buku-kas", authMiddleware, require("./bukuKasRoutes"));
router.use("/kartu-stock", authMiddleware, require("./kartuStockRoutes"));
router.use("/stock-opname", authMiddleware, require("./stockOpnameRoutes"));
router.use(
  "/biaya-operasional",
  authMiddleware,
  require("./biayaOperasionalRoutes")
);
router.use(
  "/penggunaan-anggaran",
  authMiddleware,
  require("./penggunaanAnggaranRoutes")
);
router.use("/dana-proposal", authMiddleware, require("./danaProposalRoutes"));

module.exports = router;
