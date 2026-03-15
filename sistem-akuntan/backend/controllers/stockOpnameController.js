const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// Get all Stock Opname (Filter by Periode)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period_id } = req.query;

    let query = `SELECT * FROM stock_opname WHERE user_id = ?`;
    const params = [userId];

    if (period_id) {
      query += ` AND periode_id = ?`;
      params.push(period_id);
    }

    query += ` ORDER BY created_at DESC, id DESC`;

    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(query, params);
      sendSuccess(res, data, "Stock Opname retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Stock Opname error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Search Items (Autocomplete)
exports.searchItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q) return sendSuccess(res, [], "No query provided");

    const connection = await pool.getConnection();
    try {
      const [items] = await connection.query(
        `SELECT id, kode, nama_barang, satuan_barang, harga_satuan, stock_akhir 
         FROM kartu_stock 
         WHERE user_id = ? 
         AND (nama_barang LIKE ? OR kode LIKE ?) 
         LIMIT 10`,
        [userId, `%${q}%`, `%${q}%`]
      );
      sendSuccess(res, items, "Items found");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Search items error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(
        "SELECT * FROM stock_opname WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (data.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      sendSuccess(res, data[0], "Stock Opname retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Create Stock Opname
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      period_id, 
      nama_item,
      satuan,
      stock_fisik,
      stock_kartu,
      harga_satuan,
      keterangan,
    } = req.body;

    if (!nama_item || stock_fisik === undefined || stock_kartu === undefined) {
      return sendError(
        res,
        "Nama item, stock fisik, dan stock kartu harus diisi",
        400
      );
    }

    if (!period_id) {
      return sendError(res, "Periode belum dipilih", 400);
    }

    const connection = await pool.getConnection();
    try {
      const selisih = parseInt(stock_fisik) - parseInt(stock_kartu);
      const total = parseInt(stock_fisik) * (parseFloat(harga_satuan) || 0);
      const [result] = await connection.query(
        `INSERT INTO stock_opname 
         (user_id, periode_id, nama_item, satuan, stock_fisik, stock_kartu, selisih, harga_satuan, total, keterangan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          period_id, 
          nama_item,
          satuan,
          parseInt(stock_fisik),
          parseInt(stock_kartu),
          selisih,
          parseFloat(harga_satuan) || 0,
          total,
          keterangan,
        ]
      );

      sendSuccess(
        res,
        { id: result.insertId, selisih, total, ...req.body },
        "Stock Opname created",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Create Stock Opname error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      nama_item,
      satuan,
      stock_fisik,
      stock_kartu,
      harga_satuan,
      keterangan,
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.query(
        "SELECT * FROM stock_opname WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (existing.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);

      const selisih = parseInt(stock_fisik) - parseInt(stock_kartu);
      const total = parseInt(stock_fisik) * (parseFloat(harga_satuan) || 0);

      await connection.query(
        `UPDATE stock_opname 
         SET nama_item = ?, satuan = ?, stock_fisik = ?, stock_kartu = ?, selisih = ?, harga_satuan = ?, total = ?, keterangan = ?
         WHERE id = ? AND user_id = ?`,
        [
          nama_item,
          satuan,
          parseInt(stock_fisik),
          parseInt(stock_kartu),
          selisih,
          parseFloat(harga_satuan) || 0,
          total,
          keterangan,
          id,
          userId,
        ]
      );

      sendSuccess(
        res,
        { id, selisih, total, ...req.body },
        "Stock Opname updated"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Delete 
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.query(
        "SELECT * FROM stock_opname WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (existing.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      await connection.query(
        "DELETE FROM stock_opname WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      sendSuccess(res, { id }, "Stock Opname deleted");
    } finally {
      connection.release();
    }
  } catch (error) {
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period_id } = req.query;

    let baseQuery = " WHERE user_id = ?";
    const params = [userId];
    if (period_id) {
      baseQuery += " AND periode_id = ?";
      params.push(period_id);
    }

    const connection = await pool.getConnection();
    try {
      const [totalItems] = await connection.query(
        `SELECT COUNT(*) as count FROM stock_opname ${baseQuery}`,
        params
      );
      const [totalSelisih] = await connection.query(
        `SELECT COALESCE(SUM(ABS(selisih)), 0) as total FROM stock_opname ${baseQuery}`,
        params
      );
      const [totalNilai] = await connection.query(
        `SELECT COALESCE(SUM(total), 0) as total FROM stock_opname ${baseQuery}`,
        params
      );
      const [itemsWithVariance] = await connection.query(
        `SELECT COUNT(*) as count FROM stock_opname ${baseQuery} AND selisih != 0`,
        params
      );

      sendSuccess(
        res,
        {
          totalItems: totalItems[0].count,
          itemsWithVariance: itemsWithVariance[0].count,
          totalSelisih: totalSelisih[0].total,
          totalNilai: totalNilai[0].total,
        },
        "Summary retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Summary error:", error); 
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
