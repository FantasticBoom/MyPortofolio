const db = require("../config/database");
const bcrypt = require("bcrypt");
const XLSX = require("xlsx");
const fs = require("fs");

const response = (res, success, message, data = null) => {
  return res.status(success ? 200 : 500).json({ success, message, data });
};

const manajemenController = {
  // --- USER MANAGEMENT ---
  getAllUsers: async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, username, nama_lengkap, email, role FROM users"
      );
      response(res, true, "Data user berhasil diambil", rows);
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal mengambil data user");
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return response(res, false, "Unauthorized");
      const [rows] = await db.query(
        "SELECT id, username, nama_lengkap, email, role FROM users WHERE id = ?",
        [userId]
      );
      if (rows.length === 0)
        return response(res, false, "User tidak ditemukan");
      response(res, true, "Profile user", rows[0]);
    } catch (error) {
      response(res, false, "Gagal mengambil profile");
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { nama_lengkap, email } = req.body;

      await db.query(
        "UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?",
        [nama_lengkap, email, userId]
      );

      response(res, true, "Profile berhasil diupdate");
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal update profile");
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;

      const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
        userId,
      ]);

      if (rows.length === 0) {
        return response(res, false, "User tidak ditemukan");
      }

      const isValid = await bcrypt.compare(oldPassword, rows[0].password);
      if (!isValid) {
        return response(res, false, "Password lama salah");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      response(res, true, "Password berhasil diubah");
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal mengubah password");
    }
  },

  getStatistics: async (req, res) => {
    try {
      const [userCount] = await db.query("SELECT COUNT(*) as total FROM users");
      const [codingCount] = await db.query(
        "SELECT COUNT(*) as total FROM pengkodean_barang"
      );

      response(res, true, "Statistik berhasil diambil", {
        users: userCount[0].total,
        items: codingCount[0].total,
      });
    } catch (error) {
      console.error(error);
      response(res, true, "Statistik default", { users: 0, items: 0 });
    }
  },

  // --- PERIODE MANAGEMENT ---
  getPeriods: async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM periods ORDER BY start_date DESC"
      );
      response(res, true, "Data periode berhasil diambil", rows);
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal mengambil periode");
    }
  },

  createPeriod: async (req, res) => {
    const { nama_periode, start_date, end_date, status } = req.body;
    try {
      await db.query(
        "INSERT INTO periods (nama_periode, start_date, end_date, status) VALUES (?, ?, ?, ?)",
        [nama_periode, start_date, end_date, status || "active"]
      );
      response(res, true, "Periode berhasil dibuat");
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal membuat periode");
    }
  },

  updatePeriod: async (req, res) => {
    const { id } = req.params;
    const { nama_periode, start_date, end_date, status } = req.body;
    try {
      await db.query(
        "UPDATE periods SET nama_periode=?, start_date=?, end_date=?, status=? WHERE id=?",
        [nama_periode, start_date, end_date, status, id]
      );
      response(res, true, "Periode berhasil diupdate");
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal update periode");
    }
  },

  deletePeriod: async (req, res) => {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM periods WHERE id = ?", [id]);
      response(res, true, "Periode berhasil dihapus");
    } catch (error) {
      console.error(error);
      response(res, false, "Gagal hapus periode");
    }
  },

  // --- PENGKODEAN BARANG ---
  getCodings: async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM pengkodean_barang ORDER BY id DESC"
      );
      response(res, true, "Data coding berhasil diambil", rows);
    } catch (error) {
      console.error("Database Error:", error);
      response(res, false, "Gagal mengambil data coding: " + error.message);
    }
  },

  createCoding: async (req, res) => {
    const { kode, nama_barang, kategori } = req.body;
    try {
      await db.query(
        "INSERT INTO pengkodean_barang (kode, nama_barang, kategori) VALUES (?, ?, ?)",
        [kode, nama_barang, kategori]
      );
      response(res, true, "Data barang berhasil disimpan");
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return response(res, false, "Kode barang sudah ada");
      }
      response(res, false, "Gagal menyimpan data barang");
    }
  },

  updateCoding: async (req, res) => {
    const { id } = req.params;
    const { kode, nama_barang, kategori } = req.body;
    try {
      const [result] = await db.query(
        "UPDATE pengkodean_barang SET kode=?, nama_barang=?, kategori=? WHERE id=?",
        [kode, nama_barang, kategori, id]
      );

      if (result.affectedRows === 0) {
        return response(res, false, "Data tidak ditemukan");
      }

      response(res, true, "Data barang berhasil diupdate");
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return response(res, false, "Kode barang sudah ada");
      }
      response(res, false, "Gagal update data barang");
    }
  },

  deleteCoding: async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await db.query(
        "DELETE FROM pengkodean_barang WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return response(res, false, "Gagal: Data tidak ditemukan.");
      }

      response(res, true, "Data barang berhasil dihapus");
    } catch (error) {
      console.error("Delete Error:", error);
      response(res, false, "Gagal menghapus data: " + error.message);
    }
  },

  uploadCodings: async (req, res) => {
    try {
      if (!req.file) return response(res, false, "Tidak ada file");

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          const kode = item.Kode || item.kode || item["Kode Barang"];
          const nama =
            item.NamaBarang || item.nama_barang || item["Nama Barang"];
          const kat = item.Kategori || item.kategori;

          if (kode && nama) {
            await db.query(
              "INSERT INTO pengkodean_barang (kode, nama_barang, kategori) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nama_barang=VALUES(nama_barang), kategori=VALUES(kategori)",
              [kode, nama, kat || "Operasional"]
            );
            successCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      fs.unlinkSync(req.file.path);
      response(
        res,
        true,
        `Import berhasil: ${successCount} data, ${errorCount} error`
      );
    } catch (error) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      response(res, false, "Gagal import file: " + error.message);
    }
  },

  // --- PRICES (HARGA BARANG) ---
  getPrices: async (req, res) => {
    try {
      const query = `
        SELECT 
          id,
          kode_barang, 
          nama_barang, 
          harga,
          satuan
        FROM harga_barang 
        ORDER BY kode_barang ASC
      `;

      const [rows] = await db.query(query);
      response(res, true, "Data harga barang berhasil diambil", rows);
    } catch (error) {
      console.error("Get Prices Error:", error);
      response(res, false, "Gagal mengambil data harga: " + error.message);
    }
  },

  uploadPrices: async (req, res) => {
    try {
      if (!req.file) return response(res, false, "Tidak ada file");

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      for (const item of data) {
        const kode = item.Kode || item.kode || item.kode_barang;
        const nama = item.Nama || item.nama || item.nama_barang;
        const harga = item.Harga || item.harga;
        const satuan = item.Satuan || item.satuan || "Pcs";

        if (kode && nama && harga) {
          await db.query(
            "INSERT INTO harga_barang (kode_barang, nama_barang, harga, satuan) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nama_barang=VALUES(nama_barang), harga=VALUES(harga), satuan=VALUES(satuan)",
            [kode, nama, harga, satuan]
          );
        }
      }

      fs.unlinkSync(req.file.path);
      response(res, true, "Upload harga berhasil");
    } catch (error) {
      console.error(error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      response(res, false, "Gagal upload harga");
    }
  },
};

module.exports = manajemenController;
