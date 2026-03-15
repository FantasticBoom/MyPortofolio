const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");
const fs = require("fs");
const path = require("path");

// Helper: Recalculate semua saldo
const recalculateAllSaldo = async (connection, userId) => {
  try {
    const [allData] = await connection.query(
      `SELECT id, pemasukan, pengeluaran 
       FROM buku_kas 
       WHERE user_id = ? 
       ORDER BY tanggal ASC, id ASC`,
      [userId]
    );

    let runningSaldo = 0;

    for (const row of allData) {
      const pemasukan = Number(row.pemasukan) || 0;
      const pengeluaran = Number(row.pengeluaran) || 0;

      runningSaldo = runningSaldo + pemasukan - pengeluaran;

      await connection.query("UPDATE buku_kas SET saldo = ? WHERE id = ?", [
        runningSaldo,
        row.id,
      ]);
    }

    return runningSaldo;
  } catch (error) {
    console.error("Recalculate error:", error);
    throw error;
  }
};

// 1. Get Periods
exports.getPeriods = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [periods] = await connection.query(
        "SELECT id, nama_periode, start_date, end_date FROM periods ORDER BY start_date DESC"
      );
      sendSuccess(res, periods, "Periods retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Periods error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 2. Get All Buku Kas (Filter by Period ID)
exports.getAll = async (req, res) => {
  const { period_id } = req.query;
  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    if (!period_id) {
      return sendSuccess(res, [], "Silakan pilih periode terlebih dahulu");
    }

    // Ambil tanggal periode
    const [periodData] = await connection.query(
      "SELECT start_date, end_date FROM periods WHERE id = ?",
      [period_id]
    );

    if (periodData.length === 0) {
      return sendError(res, "Periode tidak ditemukan", 404);
    }

    const { start_date, end_date } = periodData[0];

    const [data] = await connection.query(
      `SELECT id, tanggal, kode_akun, no_bukti, uraian, pemasukan, pengeluaran, saldo, bukti_nota, keterangan
       FROM buku_kas 
       WHERE user_id = ? 
         AND tanggal >= ? 
         AND tanggal <= ?
       ORDER BY tanggal ASC, id ASC`,
      [userId, start_date, end_date]
    );

    sendSuccess(res, data, "Buku Kas retrieved");
  } catch (error) {
    console.error("Get All Buku Kas error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  } finally {
    connection.release();
  }
};

// 3. Get Single Buku Kas
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(
        "SELECT *, keterangan FROM buku_kas WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (data.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      sendSuccess(res, data[0], "Buku Kas retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 4. Create Transaksi
exports.create = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      tanggal,
      kode_akun,
      no_bukti,
      uraian,
      pemasukan,
      pengeluaran,
      keterangan,
    } = req.body; 
    const userId = req.user.id;
    const bukti_nota = req.file ? req.file.filename : null;

    // field keterangan
    await connection.query(
      `INSERT INTO buku_kas (user_id, tanggal, kode_akun, no_bukti, uraian, pemasukan, pengeluaran, bukti_nota, keterangan, saldo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        tanggal,
        kode_akun,
        no_bukti,
        uraian,
        pemasukan || 0,
        pengeluaran || 0,
        bukti_nota,
        keterangan, 
      ]
    );

    await recalculateAllSaldo(connection, userId);

    await connection.commit();
    sendSuccess(res, null, "Data berhasil disimpan");
  } catch (error) {
    await connection.rollback();
    console.error("Create Buku Kas error:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    sendError(res, errorMessages.SERVER_ERROR, 500);
  } finally {
    connection.release();
  }
};

// 5. Update Transaksi
exports.update = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      tanggal,
      kode_akun,
      no_bukti,
      uraian,
      pemasukan,
      pengeluaran,
      keterangan,
    } = req.body;
    const userId = req.user.id;
    const newFile = req.file ? req.file.filename : null;

    const [existing] = await connection.query(
      "SELECT bukti_nota FROM buku_kas WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
    }

    let bukti_nota = existing[0].bukti_nota;
    if (newFile) {
      if (bukti_nota) {
        const oldPath = path.join(__dirname, "../uploads", bukti_nota);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      bukti_nota = newFile;
    }

    await connection.query(
      `UPDATE buku_kas 
       SET tanggal=?, kode_akun=?, no_bukti=?, uraian=?, pemasukan=?, pengeluaran=?, bukti_nota=?, keterangan=?
       WHERE id=? AND user_id=?`,
      [
        tanggal,
        kode_akun,
        no_bukti,
        uraian,
        pemasukan || 0,
        pengeluaran || 0,
        bukti_nota,
        keterangan, 
        id,
        userId,
      ]
    );

    await recalculateAllSaldo(connection, userId);

    await connection.commit();
    sendSuccess(res, null, "Data updated successfully");
  } catch (error) {
    await connection.rollback();
    console.error("Update Buku Kas error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  } finally {
    connection.release();
  }
};

// 6. Delete Transaksi
exports.delete = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await connection.query(
      "SELECT bukti_nota FROM buku_kas WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
    }

    if (existing[0].bukti_nota) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        existing[0].bukti_nota
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await connection.query(
      "DELETE FROM buku_kas WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    await recalculateAllSaldo(connection, userId);

    await connection.commit();
    sendSuccess(res, { id }, "Buku Kas deleted");
  } catch (error) {
    await connection.rollback();
    console.error("Delete Buku Kas error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  } finally {
    connection.release();
  }
};

// 7. Search Items (AUTOCOMPLETE FEATURE - FILTERED)
exports.searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    const connection = await pool.getConnection();

    try {
      if (!q) {
        return sendSuccess(res, [], "No query provided");
      }

      const searchTerm = `%${q}%`;

      const [items] = await connection.query(
        `SELECT kode, nama_barang 
         FROM pengkodean_barang 
         WHERE (kode LIKE ? OR nama_barang LIKE ?)
         AND kategori = 'transaksi' 
         LIMIT 10`,
        [searchTerm, searchTerm]
      );

      sendSuccess(res, items, "Items retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Search items error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
