const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const errorMessages = require("../utils/errorMessages");

// Get Dashboard Summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      const [balanceData] = await connection.query(
        `SELECT saldo FROM buku_kas 
         WHERE user_id = ? 
         ORDER BY tanggal DESC, id DESC 
         LIMIT 1`,
        [userId]
      );
      const currentBalance = balanceData.length > 0 ? balanceData[0].saldo : 0;

      // A. Cari Periode Aktif berdasarkan Tanggal Hari Ini (CURDATE)
      const [activePeriodData] = await connection.query(
        `SELECT nama_periode, start_date, end_date 
         FROM periods 
         WHERE CURDATE() BETWEEN start_date AND end_date
         LIMIT 1`
      );

      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      if (activePeriodData.length > 0) {
        const { nama_periode, start_date, end_date } = activePeriodData[0];

        // 2. TOTAL PEMASUKAN (Berdasarkan Dana Diterima pada Periode Aktif)
        const [incomeData] = await connection.query(
          `SELECT dana_diterima FROM dana_proposal 
           WHERE periode = ? 
           LIMIT 1`,
          [nama_periode]
        );
        totalPemasukan =
          incomeData.length > 0 ? incomeData[0].dana_diterima : 0;

        // 3. TOTAL PENGELUARAN (REVISI: Filter berdasarkan Range Tanggal Periode Aktif)
        const [expenseData] = await connection.query(
          `SELECT COALESCE(SUM(pengeluaran), 0) as total 
           FROM buku_kas 
           WHERE user_id = ? 
           AND tanggal >= ? 
           AND tanggal <= ?`,
          [userId, start_date, end_date]
        );
        totalPengeluaran = expenseData[0].total;
      } else {
        totalPemasukan = 0;
        totalPengeluaran = 0;
      }

      // 4. STOCK KELUAR KEMARIN (Tetap logic lama)
      const [stockData] = await connection.query(
        `SELECT COALESCE(SUM(keluar), 0) as total FROM kartu_stock 
         WHERE user_id = ? AND DATE(tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
        [userId]
      );

      sendSuccess(
        res,
        {
          sisaSaldo: currentBalance || 0,
          totalPemasukan: Number(totalPemasukan),
          totalPengeluaran: Number(totalPengeluaran),
          stockKeluarKemarin: stockData[0].total || 0,
        },
        "Dashboard summary retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Dashboard summary error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Graph Data (Dana Pengajuan Per Periode)
exports.getGraphData = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [graphData] = await connection.query(
        `SELECT 
           periode,
           dana_diajukan,
           dana_diterima
         FROM dana_proposal
         ORDER BY id ASC
         LIMIT 12`
      );

      sendSuccess(res, graphData || [], "Graph data retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Graph data error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Peringatan Stock
exports.getStockWarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      const [warnings] = await connection.query(
        `SELECT 
           id,
           nama_item as nama_barang,
           'ATK' as kategori,
           stock_fisik as stock_saat_ini,
           CASE 
             WHEN stock_fisik <= 5 THEN 'Kritis'
             WHEN stock_fisik <= 10 THEN 'Rendah'
           END as status
         FROM stock_opname
         WHERE user_id = ? AND stock_fisik <= 10
         ORDER BY stock_fisik ASC`,
        [userId]
      );

      sendSuccess(res, warnings || [], "Stock warnings retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Stock warnings error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Current Month Stock
exports.getCurrentMonthStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      const [stockData] = await connection.query(
        `SELECT COALESCE(SUM(stock_akhir), 0) as total_stock FROM kartu_stock
         WHERE user_id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())`,
        [userId]
      );

      sendSuccess(
        res,
        {
          totalStock: stockData[0].total_stock || 0,
        },
        "Current month stock retrieved"
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Current month stock error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};

// Get Stock Out Details (Detail Barang Keluar Kemarin)
exports.getStockOutDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    try {
      const [details] = await connection.query(
        `SELECT
           id,
           tanggal,
           nama_barang,
           keluar as jumlah_keluar,
           satuan_barang as satuan, 
           keterangan
         FROM kartu_stock
         WHERE user_id = ?
           AND DATE(tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
           AND keluar > 0
         ORDER BY id DESC`,
        [userId]
      );

      sendSuccess(res, details || [], "Detail stock keluar berhasil diambil");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Stock out details error:", error);
    sendError(res, errorMessages.SERVER_ERROR, 500);
  }
};
