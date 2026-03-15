const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const config = require("../config/env");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// Register
exports.register = async (req, res) => {
  try {
    const { username, password, email, nama_lengkap } = req.body;

    // Validasi input
    if (!username || !password || !email) {
      return sendError(res, "Username, password, dan email harus diisi", 400);
    }

    const connection = await pool.getConnection();

    try {
      // Check if user already exists
      const [existingUser] = await connection.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existingUser.length > 0) {
        return sendError(res, errorMessages.AUTH_USER_EXISTS, 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await connection.query(
        "INSERT INTO users (username, password, email, nama_lengkap) VALUES (?, ?, ?, ?)",
        [username, hashedPassword, email, nama_lengkap || username]
      );

      const userId = result.insertId;

      // Create JWT Token
      const token = jwt.sign({ id: userId, username }, config.jwt.secret, {
        expiresIn: config.jwt.expire,
      });

      sendSuccess(
        res,
        {
          userId,
          username,
          token,
        },
        "User berhasil terdaftar",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Register error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return sendError(res, "Username dan password harus diisi", 400);
    }

    const connection = await pool.getConnection();

    try {
      // Get user
      const [users] = await connection.query(
        "SELECT id, username, password, email, nama_lengkap FROM users WHERE username = ?",
        [username]
      );

      if (users.length === 0) {
        return sendError(res, errorMessages.AUTH_INVALID_CREDENTIALS, 401);
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return sendError(res, errorMessages.AUTH_INVALID_CREDENTIALS, 401);
      }

      // Create JWT Token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
      );

      sendSuccess(
        res,
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          token,
        },
        "Login berhasil"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        "SELECT id, username, email, nama_lengkap, role FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        return sendError(res, errorMessages.AUTH_USER_NOT_FOUND, 404);
      }

      sendSuccess(res, users[0], "User data retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get current user error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
