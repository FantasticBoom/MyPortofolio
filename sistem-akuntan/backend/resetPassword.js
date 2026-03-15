// server/resetPassword.js
const { pool } = require("./config/database");
const bcrypt = require("bcryptjs");

const resetAdminPassword = async () => {
  const usernameTarget = "admin"; // Username yang mau direset
  const passwordBaru = "admin123"; // Password baru yang diinginkan

  console.log(`Sedang mereset password untuk user: ${usernameTarget}...`);

  try {
    // 1. Enkripsi password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordBaru, salt);

    // 2. Update di database
    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, usernameTarget]
    );

    if (result.affectedRows > 0) {
      console.log("✅ BERHASIL!");
      console.log(
        `Password untuk '${usernameTarget}' telah diubah menjadi: ${passwordBaru}`
      );
    } else {
      console.log("❌ GAGAL: Username tidak ditemukan.");
    }
  } catch (error) {
    console.error("Terjadi Error:", error);
  } finally {
    // Tutup koneksi database
    process.exit();
  }
};

resetAdminPassword();
