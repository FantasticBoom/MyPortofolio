const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// --- MAPPING LABEL ---
const JENIS_BIAYA_MAP = {
  biaya_sewa: "Biaya Sewa",
  biaya_operasional: "Biaya Operasional",
  biaya_bahan_baku: "Biaya Bahan Baku",
  biaya_insentif: "Biaya Insentif Mitra",
};

// --- HELPER FUNCTION UNTUK SINKRONISASI ---
const syncBiayaToRincian = async (
  connection,
  userId,
  periodId,
  penggunaanAnggaranId
) => {
  const [summaryBiaya] = await connection.query(
    `SELECT jenis_biaya, COALESCE(SUM(nominal), 0) as total_terealisasi
     FROM biaya_operasional
     WHERE user_id = ? AND periode_id = ?
     GROUP BY jenis_biaya`,
    [userId, periodId]
  );

  for (const item of summaryBiaya) {
    const namaItem = JENIS_BIAYA_MAP[item.jenis_biaya] || item.jenis_biaya;
    const totalTerealisasi = parseFloat(item.total_terealisasi);
    const [existingRincian] = await connection.query(
      `SELECT id, dana_diajukan FROM rincian_keuangan 
       WHERE penggunaan_anggaran_id = ? AND item = ?`,
      [penggunaanAnggaranId, namaItem]
    );

    if (existingRincian.length > 0) {
      const rincian = existingRincian[0];
      const sisaDana = rincian.dana_diajukan - totalTerealisasi;

      await connection.query(
        `UPDATE rincian_keuangan 
         SET dana_terealisasi = ?, sisa_dana = ?
         WHERE id = ?`,
        [totalTerealisasi, sisaDana, rincian.id]
      );
    } else {
      const sisaDana = 0 - totalTerealisasi; 
      await connection.query(
        `INSERT INTO rincian_keuangan 
         (penggunaan_anggaran_id, item, dana_diajukan, dana_terealisasi, sisa_dana)
         VALUES (?, ?, ?, ?, ?)`,
        [penggunaanAnggaranId, namaItem, 0, totalTerealisasi, sisaDana]
      );
    }
  }
};

// 1. GET ALL PERIODS (MASTER DATA)
exports.getAllPeriods = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [periods] = await connection.query(
        "SELECT * FROM periods ORDER BY start_date DESC"
      );
      sendSuccess(res, periods, "Daftar periode berhasil dimuat");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Periods error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 2. GET REPORT BY PERIOD ID (DENGAN AUTO SYNC)
exports.getByPeriodId = async (req, res) => {
  try {
    const { periodId } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      // A. Ambil Data Parent
      const [main] = await connection.query(
        "SELECT * FROM penggunaan_anggaran WHERE periode_id = ? AND user_id = ?",
        [periodId, userId]
      );

      if (main.length === 0) {
        return sendSuccess(res, null, "Belum ada laporan");
      }

      const id = main[0].id;

      // B. LAKUKAN SINKRONISASI 
      await syncBiayaToRincian(connection, userId, periodId, id);

      // C. Ambil Rincian (Setelah disinkron)
      const [rincian] = await connection.query(
        "SELECT * FROM rincian_keuangan WHERE penggunaan_anggaran_id = ?",
        [id]
      );

      const [keterangan] = await connection.query(
        "SELECT * FROM keterangan_detail WHERE penggunaan_anggaran_id = ?",
        [id]
      );

      sendSuccess(
        res,
        {
          main: main[0],
          rincian,
          keterangan,
        },
        "Data retrieved with sync"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get By Period ID error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 3. CREATE / INIT (Updated)
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periode, tanggal_awal, tanggal_akhir, period_id } = req.body;

    const connection = await pool.getConnection();
    try {
      const [exist] = await connection.query(
        "SELECT id FROM penggunaan_anggaran WHERE periode_id = ? AND user_id = ?",
        [period_id, userId]
      );

      if (exist.length > 0)
        return sendSuccess(res, { id: exist[0].id }, "Data exists", 200);

      const [result] = await connection.query(
        `INSERT INTO penggunaan_anggaran 
         (user_id, periode_id, periode, tanggal_awal, tanggal_akhir)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, period_id, periode, tanggal_awal, tanggal_akhir]
      );

      const newId = result.insertId;

      // Auto Sync saat pertama kali create juga
      await syncBiayaToRincian(connection, userId, period_id, newId);

      sendSuccess(res, { id: newId, ...req.body }, "Created", 201);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Create error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.addRincian = async (req, res) => {
  try {
    const { penggunaan_anggaran_id, item, dana_diajukan, dana_terealisasi } =
      req.body;
    const connection = await pool.getConnection();
    try {
      const sisa_dana = (dana_diajukan || 0) - (dana_terealisasi || 0);
      const [result] = await connection.query(
        `INSERT INTO rincian_keuangan (penggunaan_anggaran_id, item, dana_diajukan, dana_terealisasi, sisa_dana) VALUES (?, ?, ?, ?, ?)`,
        [
          penggunaan_anggaran_id,
          item,
          dana_diajukan || 0,
          dana_terealisasi || 0,
          sisa_dana,
        ]
      );
      sendSuccess(
        res,
        { id: result.insertId, sisa_dana, ...req.body },
        "Rincian created",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.updateRincian = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, dana_diajukan, dana_terealisasi } = req.body;
    const connection = await pool.getConnection();
    try {
      const sisa_dana = (dana_diajukan || 0) - (dana_terealisasi || 0);
      await connection.query(
        `UPDATE rincian_keuangan SET item = ?, dana_diajukan = ?, dana_terealisasi = ?, sisa_dana = ? WHERE id = ?`,
        [item, dana_diajukan, dana_terealisasi, sisa_dana, id]
      );
      sendSuccess(
        res,
        { id, item, dana_diajukan, dana_terealisasi, sisa_dana },
        "Rincian updated"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.addKeterangan = async (req, res) => {
  try {
    const { penggunaan_anggaran_id, item, keterangan } = req.body;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `INSERT INTO keterangan_detail (penggunaan_anggaran_id, item, keterangan) VALUES (?, ?, ?)`,
        [penggunaan_anggaran_id, item, keterangan]
      );
      sendSuccess(
        res,
        { id: result.insertId, ...req.body },
        "Keterangan created",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.updateKeterangan = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, keterangan } = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `UPDATE keterangan_detail SET item = ?, keterangan = ? WHERE id = ?`,
        [item, keterangan, id]
      );
      sendSuccess(res, { id, ...req.body }, "Keterangan updated");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.deleteRincian = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      await connection.query("DELETE FROM rincian_keuangan WHERE id = ?", [id]);
      sendSuccess(res, { id }, "Rincian deleted");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

exports.deleteKeterangan = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      await connection.query("DELETE FROM keterangan_detail WHERE id = ?", [
        id,
      ]);
      sendSuccess(res, { id }, "Keterangan deleted");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Summary 
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periode } = req.query;
    const connection = await pool.getConnection();
    try {
      const [totalDiajukan] = await connection.query(
        `SELECT COALESCE(SUM(dana_diajukan), 0) as total FROM rincian_keuangan rk
                 JOIN penggunaan_anggaran pa ON rk.penggunaan_anggaran_id = pa.id
                 WHERE pa.user_id = ? AND pa.periode = ?`,
        [userId, periode]
      );
      const [totalTerealisasi] = await connection.query(
        `SELECT COALESCE(SUM(dana_terealisasi), 0) as total FROM rincian_keuangan rk
                 JOIN penggunaan_anggaran pa ON rk.penggunaan_anggaran_id = pa.id
                 WHERE pa.user_id = ? AND pa.periode = ?`,
        [userId, periode]
      );
      const sisa = totalDiajukan[0].total - totalTerealisasi[0].total;
      sendSuccess(
        res,
        {
          totalDiajukan: totalDiajukan[0].total,
          totalTerealisasi: totalTerealisasi[0].total,
          sisaDana: sisa,
        },
        "Summary retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
