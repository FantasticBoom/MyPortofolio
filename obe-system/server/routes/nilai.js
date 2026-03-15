// routes/nilai.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/nilai/:rpsId", (req, res) => {
  const sql = "SELECT * FROM nilai_mahasiswa WHERE rps_id = ?";
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

router.post("/nilai/save", (req, res) => {
  const { rps_id, mahasiswa_id, sub_cpmk_id, nilai } = req.body;
  const checkSql =
    "SELECT id FROM nilai_mahasiswa WHERE rps_id = ? AND mahasiswa_id = ? AND sub_cpmk_id = ?";
  db.query(checkSql, [rps_id, mahasiswa_id, sub_cpmk_id], (err, data) => {
    if (err) return res.json({ Error: err });

    if (data.length > 0) {
      db.query(
        "UPDATE nilai_mahasiswa SET nilai = ? WHERE id = ?",
        [nilai, data[0].id],
        (err) => {
          if (err) return res.json({ Error: err });
          return res.json({ Status: "Success" });
        }
      );
    } else {
      db.query(
        "INSERT INTO nilai_mahasiswa (rps_id, mahasiswa_id, sub_cpmk_id, nilai) VALUES (?, ?, ?, ?)",
        [rps_id, mahasiswa_id, sub_cpmk_id, nilai],
        (err) => {
          if (err) return res.json({ Error: err });
          return res.json({ Status: "Success" });
        }
      );
    }
  });
});

router.get("/nilai/structure/:rpsId", (req, res) => {
  const sql = `
        SELECT k.id as korelasi_id, k.persentase, c.id as cpl_id, c.kode_cpl, s.id as sub_cpmk_id, s.kode_sub_cpmk
        FROM rps_korelasi_cpl k
        JOIN cpl c ON k.cpl_id = c.id
        JOIN sub_cpmk s ON k.sub_cpmk_id = s.id
        WHERE k.rps_id = ? AND k.persentase > 0
        ORDER BY c.kode_cpl ASC, s.kode_sub_cpmk ASC
    `;
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

module.exports = router;
