require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE,
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 1800000, // 30 minutes
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5242880, // 5MB
    uploadDir: "./uploads",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};
