const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// Get all Biaya Operasional
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periode_id, jenis_biaya } = req.query;

    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT 
          bo.*, 
          p.nama_periode,
          p.start_date as period_start,
          p.end_date as period_end
        FROM biaya_operasional bo
        LEFT JOIN periods p ON bo.periode_id = p.id
        WHERE bo.user_id = ?`;

      const params = [userId];

      if (periode_id) {
        query += " AND bo.periode_id = ?";
        params.push(periode_id);
      }

      if (jenis_biaya) {
        query += " AND bo.jenis_biaya = ?";
        params.push(jenis_biaya);
      }

      query += " ORDER BY bo.tanggal DESC, bo.id DESC";

      const [data] = await connection.query(query, params);

      sendSuccess(res, data, "Biaya Operasional retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Biaya Operasional error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get unique periods
exports.getPeriods = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [data] = await connection.query(
        "SELECT id, nama_periode, start_date, end_date, status FROM periods ORDER BY id DESC"
      );

      sendSuccess(res, data, "Periods retrieved from master table");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get periods error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// FUNGSI SEARCH BARANG
exports.searchBarangOperasional = async (req, res) => {
  try {
    const { q, jenis_biaya } = req.query;

    if (!q) {
      return sendSuccess(res, [], "No query provided");
    }

    const connection = await pool.getConnection();

    try {
      let query = "";
      let params = [];
      const searchParam = `%${q}%`;

      if (jenis_biaya === "biaya_operasional") {
        query = `
          SELECT kode, nama_barang, 0 as harga, '' as satuan 
          FROM pengkodean_barang 
          WHERE kategori = 'operasional' 
          AND (kode LIKE ? OR nama_barang LIKE ?)
          LIMIT 10
        `;
        params = [searchParam, searchParam];
      } else if (jenis_biaya === "biaya_bahan_baku") {
        const queryA = `
          SELECT kode, nama_barang, 0 as harga, '' as satuan 
          FROM pengkodean_barang 
          WHERE kategori LIKE '%bahan%' 
          AND (kode LIKE ? OR nama_barang LIKE ?)
        `;

        // Cari harga-barang
        const queryB = `
          SELECT kode_barang as kode, nama_barang, harga, satuan 
          FROM harga_barang 
          WHERE kode_barang LIKE ? OR nama_barang LIKE ?
        `;

        // Gabungkan dengan UNION ALL
        query = `(${queryA}) UNION ALL (${queryB}) LIMIT 10`;

        // Parameter urut: queryA (2 params) lalu queryB (2 params)
        params = [searchParam, searchParam, searchParam, searchParam];
      } else {
        // Default (jika jenis biaya lain, misal sewa, return kosong atau implementasi lain)
        return sendSuccess(res, [], "Search not implemented for this type");
      }

      const [results] = await connection.query(query, params);

      sendSuccess(res, results, "Data barang ditemukan");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Search barang error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get single Biaya Operasional
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    try {
      const [data] = await connection.query(
        "SELECT * FROM biaya_operasional WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (data.length === 0) {
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      }

      sendSuccess(res, data[0], "Biaya Operasional retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Biaya Operasional by ID error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Create Biaya Operasional
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      periode_id,
      tanggal,
      kode,
      uraian,
      jenis_biaya,
      qty,
      satuan,
      harga_satuan,
      nominal,
    } = req.body;

    if (!periode_id || !tanggal || !jenis_biaya || !uraian) {
      return sendError(
        res,
        "Periode, tanggal, jenis biaya, dan uraian harus diisi",
        400
      );
    }

    const connection = await pool.getConnection();

    try {
      let finalNominal = nominal;
      if (!nominal && qty && harga_satuan) {
        finalNominal = qty * harga_satuan;
      }

      const [result] = await connection.query(
        `INSERT INTO biaya_operasional 
         (user_id, periode_id, tanggal, kode, uraian, jenis_biaya, qty, satuan, harga_satuan, nominal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          periode_id,
          tanggal,
          kode,
          uraian,
          jenis_biaya,
          qty || 0,
          satuan,
          harga_satuan || 0,
          finalNominal || 0,
        ]
      );

      sendSuccess(
        res,
        {
          id: result.insertId,
          ...req.body,
          nominal: finalNominal || 0,
        },
        "Biaya Operasional created",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Create Biaya Operasional error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Update Biaya Operasional
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      periode_id,
      tanggal,
      kode,
      uraian,
      jenis_biaya,
      qty,
      satuan,
      harga_satuan,
      nominal,
    } = req.body;

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.query(
        "SELECT * FROM biaya_operasional WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (existing.length === 0) {
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      }

      let finalNominal = nominal;
      if (!nominal && qty && harga_satuan) {
        finalNominal = qty * harga_satuan;
      }

      await connection.query(
        `UPDATE biaya_operasional 
         SET periode_id = ?, tanggal = ?, kode = ?, uraian = ?, jenis_biaya = ?, qty = ?, satuan = ?, harga_satuan = ?, nominal = ?
         WHERE id = ? AND user_id = ?`,
        [
          periode_id,
          tanggal,
          kode,
          uraian,
          jenis_biaya,
          qty || 0,
          satuan,
          harga_satuan || 0,
          finalNominal || 0,
          id,
          userId,
        ]
      );

      sendSuccess(
        res,
        { id, ...req.body, nominal: finalNominal || 0 },
        "Biaya Operasional updated"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update Biaya Operasional error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Delete Biaya Operasional
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.query(
        "SELECT * FROM biaya_operasional WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (existing.length === 0) {
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      }

      await connection.query(
        "DELETE FROM biaya_operasional WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      sendSuccess(res, { id }, "Biaya Operasional deleted");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Delete Biaya Operasional error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Summary by Periode
exports.getSummaryByPeriode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periode_id } = req.query;

    if (!periode_id) {
      return sendError(res, "Periode ID harus diisi", 400);
    }

    const connection = await pool.getConnection();

    try {
      const [summary] = await connection.query(
        `SELECT 
           jenis_biaya,
           COUNT(*) as count,
           COALESCE(SUM(nominal), 0) as total
         FROM biaya_operasional 
         WHERE user_id = ? AND periode_id = ?
         GROUP BY jenis_biaya`,
        [userId, periode_id]
      );

      const [grandTotal] = await connection.query(
        `SELECT COALESCE(SUM(nominal), 0) as total 
         FROM biaya_operasional 
         WHERE user_id = ? AND periode_id = ?`,
        [userId, periode_id]
      );

      sendSuccess(
        res,
        {
          byType: summary,
          total: grandTotal[0].total,
        },
        "Summary retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get summary error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
