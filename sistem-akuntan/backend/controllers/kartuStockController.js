const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// Helper: Ambil Stok Terakhir (General)
const fetchLastStockData = async (connection, kode, userId) => {
  const [rows] = await connection.query(
    `SELECT stock_akhir, harga_satuan 
     FROM kartu_stock 
     WHERE kode = ? AND user_id = ? 
     ORDER BY tanggal DESC, id DESC 
     LIMIT 1`,
    [kode, userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// 1. Get Kode List
exports.getKodeList = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(
        `SELECT DISTINCT kode, nama_barang FROM kartu_stock 
         WHERE user_id = ? ORDER BY kode ASC`,
        [userId]
      );
      sendSuccess(res, data, "Kode list retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get kode list error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 2. Get Last Stock
exports.getLastStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kode } = req.query;
    if (!kode) return sendError(res, "Kode wajib diisi", 400);

    const connection = await pool.getConnection();
    try {
      const lastData = await fetchLastStockData(connection, kode, userId);
      const lastStock = lastData ? lastData.stock_akhir : 0;
      const lastPrice = lastData ? lastData.harga_satuan : 0;
      const isFirstData = !lastData;
      sendSuccess(
        res,
        { lastStock, lastPrice, isFirstData },
        "Last stock retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Last Stock error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 3. Get Stock Batches
exports.getStockBatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kode } = req.query;
    if (!kode) return sendError(res, "Kode wajib diisi", 400);

    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT t1.harga_satuan, t1.stock_akhir
        FROM kartu_stock t1
        INNER JOIN (
            SELECT MAX(id) as max_id
            FROM kartu_stock
            WHERE kode = ? AND user_id = ?
            GROUP BY harga_satuan
        ) t2 ON t1.id = t2.max_id
        WHERE t1.stock_akhir > 0
        ORDER BY t1.harga_satuan ASC
      `;

      const [batches] = await connection.query(query, [kode, userId]);
      sendSuccess(res, batches, "Stock batches retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Stock Batches error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 4. Get All by Kode
exports.getByKode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kode } = req.query;
    if (!kode) return sendError(res, "Kode harus diisi", 400);

    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(
        `SELECT * FROM kartu_stock WHERE user_id = ? AND kode = ? ORDER BY tanggal DESC, id DESC`,
        [userId, kode]
      );
      sendSuccess(res, data || [], "Kartu Stock retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get Kartu Stock error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 5. Get By ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [data] = await connection.query(
        "SELECT * FROM kartu_stock WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (data.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      sendSuccess(res, data[0], "Kartu Stock retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get by ID error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 6. Create 
exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      kode,
      nama_barang,
      satuan_barang,
      tanggal,
      masuk,
      keluar,
      harga_satuan,
      keterangan,
      stock_awal,
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const finalStockAwal = Number(stock_awal) || 0;
      const valMasuk = Number(masuk) || 0;
      const valKeluar = Number(keluar) || 0;
      const valHarga = Number(harga_satuan) || 0;

      const stock_akhir = finalStockAwal + valMasuk - valKeluar;
      const nilai_persediaan = stock_akhir * valHarga;

      const [result] = await connection.query(
        `INSERT INTO kartu_stock 
         (user_id, kode, nama_barang, satuan_barang, tanggal, stock_awal, masuk, keluar, stock_akhir, harga_satuan, nilai_persediaan, keterangan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          kode,
          nama_barang,
          satuan_barang,
          tanggal,
          finalStockAwal,
          valMasuk,
          valKeluar,
          stock_akhir,
          valHarga,
          nilai_persediaan,
          keterangan,
        ]
      );

      sendSuccess(
        res,
        {
          id: result.insertId,
          stock_awal: finalStockAwal,
          stock_akhir,
          ...req.body,
        },
        "Data berhasil disimpan",
        201
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Create error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 7. Update
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      kode,
      nama_barang,
      satuan_barang,
      tanggal,
      stock_awal,
      masuk,
      keluar,
      harga_satuan,
      keterangan,
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.query(
        "SELECT * FROM kartu_stock WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (existing.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);

      const valStockAwal = Number(stock_awal) || 0;
      const valMasuk = Number(masuk) || 0;
      const valKeluar = Number(keluar) || 0;
      const valHarga = Number(harga_satuan) || 0;
      const stock_akhir = valStockAwal + valMasuk - valKeluar;
      const nilai_persediaan = stock_akhir * valHarga;

      await connection.query(
        `UPDATE kartu_stock 
         SET kode=?, nama_barang=?, satuan_barang=?, tanggal=?, stock_awal=?, masuk=?, keluar=?, stock_akhir=?, harga_satuan=?, nilai_persediaan=?, keterangan=?
         WHERE id=? AND user_id=?`,
        [
          kode,
          nama_barang,
          satuan_barang,
          tanggal,
          valStockAwal,
          valMasuk,
          valKeluar,
          stock_akhir,
          valHarga,
          nilai_persediaan,
          keterangan,
          id,
          userId,
        ]
      );

      sendSuccess(res, { id, stock_akhir, ...req.body }, "Data updated");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// 8. Delete
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.query(
        "SELECT * FROM kartu_stock WHERE id=? AND user_id=?",
        [id, userId]
      );
      if (existing.length === 0)
        return sendError(res, errorMessages.DATA_NOT_FOUND, 404);
      await connection.query(
        "DELETE FROM kartu_stock WHERE id=? AND user_id=?",
        [id, userId]
      );
      sendSuccess(res, { id }, "Data deleted");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Delete error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
