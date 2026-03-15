// routes/mahasiswa.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- CRUD MAHASISWA ---
router.get("/mahasiswa", (req, res) => {
  const sql = "SELECT * FROM mahasiswa ORDER BY nim ASC";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get Mahasiswa Error" });
    return res.json(result);
  });
});

router.post("/mahasiswa", (req, res) => {
  const { nim, nama_lengkap, tahun_masuk, status } = req.body;
  const checkSql = "SELECT * FROM mahasiswa WHERE nim = ?";
  db.query(checkSql, [nim], (err, result) => {
    if (result.length > 0) return res.json({ Error: "NIM sudah terdaftar!" });

    const sql =
      "INSERT INTO mahasiswa (nim, nama_lengkap, tahun_masuk, status) VALUES (?)";
    const values = [nim, nama_lengkap, tahun_masuk, status];
    db.query(sql, [values], (err, result) => {
      if (err) return res.json({ Error: "Insert Mahasiswa Error" });
      return res.json({ Status: "Success" });
    });
  });
});

router.delete("/mahasiswa/:id", (req, res) => {
  const sql = "DELETE FROM mahasiswa WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Delete Error" });
    return res.json({ Status: "Success" });
  });
});

// --- DASHBOARD STATS ---
router.get("/dashboard/stats", (req, res) => {
  const qTotalMhs = "SELECT COUNT(*) as total FROM mahasiswa";
  const qMhsAktif =
    "SELECT COUNT(*) as total FROM mahasiswa WHERE status = 'Aktif'";
  const qMhsLulus =
    "SELECT COUNT(*) as total FROM mahasiswa WHERE status = 'Lulus'";
  const qTotalNilai = "SELECT 0 as total"; // Dummy

  const p1 = new Promise((resolve, reject) =>
    db.query(qTotalMhs, (err, data) =>
      err ? reject(err) : resolve(data[0].total)
    )
  );
  const p2 = new Promise((resolve, reject) =>
    db.query(qMhsAktif, (err, data) =>
      err ? reject(err) : resolve(data[0].total)
    )
  );
  const p3 = new Promise((resolve, reject) =>
    db.query(qMhsLulus, (err, data) =>
      err ? reject(err) : resolve(data[0].total)
    )
  );
  const p4 = new Promise((resolve, reject) =>
    db.query(qTotalNilai, (err, data) =>
      err ? reject(err) : resolve(data[0].total)
    )
  );

  Promise.all([p1, p2, p3, p4])
    .then(([totalMhs, activeMhs, lulusMhs, totalNilai]) => {
      res.json({
        total_mahasiswa: totalMhs,
        mahasiswa_aktif: activeMhs,
        mahasiswa_lulus: lulusMhs,
        total_penilaian: totalNilai,
      });
    })
    .catch((err) => res.json({ Error: "Error fetching stats" }));
});

module.exports = router;
