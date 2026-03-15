const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
require("dotenv").config();

const config = require("./config/env");
const routes = require("./routes");
const manajemenRoutes = require("./routes/manajemenRoutes");
const path = require("path");
const app = express();

// Middleware Security
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser Middleware
// PENTING: Tingkatkan limit untuk upload file
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Static Files for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Manajemen Routes
app.use("/api/manajemen", manajemenRoutes);

// Request Logging Middleware (Development)
if (config.nodeEnv === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.file) {
      console.log("File uploaded:", req.file);
    }
    next();
  });
}

// API Routes
app.use("/api", routes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "API is running", timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File terlalu besar. Maksimal 5MB",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Terlalu banyak file atau field yang tidak dikenal",
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    ...(config.nodeEnv === "development" && { error: err.stack }),
  });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Sistem Akuntan MBG API Server       ║
║   🚀 Server Running on Port ${PORT}   ║
║   Environment: ${config.nodeEnv}      ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
