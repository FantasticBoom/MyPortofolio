const pool = require("../config/database");
const { sendSuccess, sendError } = require("../utils/responseHandler");


exports.getPeriodsList = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT id, nama_periode, start_date, end_date FROM periods ORDER BY id DESC"
      );
      sendSuccess(res, rows, "List periods retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching periods:", error);
    sendError(res, "Server Error", 500);
  }
};

exports.getByPeriode = async (req, res) => {
  try {
    const { periode } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM dana_proposal WHERE periode = ?",
        [periode]
      );
      const data = rows[0] || {
        dana_diajukan: 0,
        dana_diterima: 0,
        dokumen_pengajuan: null,
        dokumen_penerimaan: null,
      };
      sendSuccess(res, data, "Data retrieved");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    sendError(res, "Server Error", 500);
  }
};

exports.saveProposal = async (req, res) => {
  try {
    const { periode, dana_diajukan, dana_diterima } = req.body;
    const filePengajuan = req.files["dokumen_pengajuan"]
      ? req.files["dokumen_pengajuan"][0].filename
      : null;
    const filePenerimaan = req.files["dokumen_penerimaan"]
      ? req.files["dokumen_penerimaan"][0].filename
      : null;

    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.query(
        "SELECT * FROM dana_proposal WHERE periode = ?",
        [periode]
      );

      if (existing.length > 0) {
        // --- UPDATE ---
        let query = `UPDATE dana_proposal SET dana_diajukan = ?, dana_diterima = ?`;
        const params = [dana_diajukan, dana_diterima];

        if (filePengajuan) {
          query += `, dokumen_pengajuan = ?`;
          params.push(filePengajuan);
        }
        if (filePenerimaan) {
          query += `, dokumen_penerimaan = ?`;
          params.push(filePenerimaan);
        }

        query += ` WHERE periode = ?`;
        params.push(periode);

        await connection.query(query, params);
      } else {
        // --- INSERT ---
        await connection.query(
          `INSERT INTO dana_proposal (periode, dana_diajukan, dana_diterima, dokumen_pengajuan, dokumen_penerimaan) VALUES (?, ?, ?, ?, ?)`,
          [periode, dana_diajukan, dana_diterima, filePengajuan, filePenerimaan]
        );
      }
      sendSuccess(res, { periode }, "Data saved successfully");
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    sendError(res, "Save failed", 500);
  }
};
