const errorMessages = {
  // Auth
  AUTH_INVALID_CREDENTIALS: "Username atau password salah",
  AUTH_USER_EXISTS: "Username sudah terdaftar",
  AUTH_USER_NOT_FOUND: "User tidak ditemukan",
  AUTH_TOKEN_EXPIRED: "Session telah berakhir",
  AUTH_UNAUTHORIZED: "Tidak memiliki akses",

  // Data
  DATA_NOT_FOUND: "Data tidak ditemukan",
  DATA_INVALID: "Data tidak valid",
  DATA_DUPLICATE: "Data sudah ada",

  // File
  FILE_NOT_FOUND: "File tidak ditemukan",
  FILE_TOO_LARGE: "Ukuran file terlalu besar",
  FILE_INVALID_TYPE: "Tipe file tidak didukung",

  // Server
  SERVER_ERROR: "Terjadi kesalahan pada server",
  DB_ERROR: "Terjadi kesalahan pada database",
};

module.exports = errorMessages;
