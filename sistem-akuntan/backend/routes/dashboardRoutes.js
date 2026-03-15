const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All dashboard routes are protected
router.use(authMiddleware);

router.get("/summary", dashboardController.getSummary);
router.get("/graph-data", dashboardController.getGraphData);
router.get("/stock-warnings", dashboardController.getStockWarnings);
router.get("/current-month-stock", dashboardController.getCurrentMonthStock);
router.get("/stock-out-details", dashboardController.getStockOutDetails);

module.exports = router;
