const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validateInput = require("../middleware/validateInput");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username tidak boleh kosong"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
    body("email").isEmail().withMessage("Email tidak valid"),
  ],
  validateInput,
  authController.register
);

// Login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username tidak boleh kosong"),
    body("password").notEmpty().withMessage("Password tidak boleh kosong"),
  ],
  validateInput,
  authController.login
);

// Get Current User
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
