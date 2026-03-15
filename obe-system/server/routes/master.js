// routes/master.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- MATA KULIAH ---
router.get("/matakuliah", (req, res) => {
  db.query("SELECT * FROM mata_kuliah", (err, result) => {
    if (err) return res.json({ Error: "Get MK Error" });
    return res.json(result);
  });
});

router.post("/matakuliah", (req, res) => {
  const sql =
    "INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester) VALUES (?)";
  const values = [
    req.body.kode_mk,
    req.body.nama_mk,
    req.body.sks,
    req.body.semester,
  ];
  db.query(sql, [values], (err, result) => {
    if (err) return res.json({ Error: "Insert MK Error" });
    return res.json({ Status: "Success" });
  });
});

// --- CPL ---
router.get("/cpl", (req, res) => {
  db.query("SELECT * FROM cpl", (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

router.post("/cpl", (req, res) => {
  const { kode_cpl, deskripsi } = req.body;
  db.query(
    "INSERT INTO cpl (kode_cpl, deskripsi) VALUES (?, ?)",
    [kode_cpl, deskripsi],
    (err, result) => {
      if (err) return res.json({ Error: err });
      return res.json({ Status: "Success" });
    }
  );
});

app.delete("/api/cpl/:id", (req, res) => {
  const sql = "DELETE FROM cpl WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Gagal hapus (Data sedang digunakan)" });
    return res.json({ Status: "Success" });
  });
});

// --- CPMK ---
router.get("/cpmk", (req, res) => {
  const sql = `
        SELECT cpmk.id, cpmk.mata_kuliah_id, cpmk.kode_cpmk, cpmk.deskripsi, mata_kuliah.nama_mk, mata_kuliah.kode_mk 
        FROM cpmk 
        JOIN mata_kuliah ON cpmk.mata_kuliah_id = mata_kuliah.id
        ORDER BY cpmk.kode_cpmk ASC
    `;
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get CPMK Error" });
    return res.json(result);
  });
});

router.post("/cpmk", (req, res) => {
  const { mata_kuliah_id, kode_cpmk, deskripsi } = req.body;
  const sql =
    "INSERT INTO cpmk (mata_kuliah_id, kode_cpmk, deskripsi) VALUES (?, ?, ?)";
  db.query(sql, [mata_kuliah_id, kode_cpmk, deskripsi], (err, result) => {
    if (err) return res.json({ Error: "Insert CPMK Error" });
    return res.json({ Status: "Success" });
  });
});

app.delete("/api/cpmk/:id", (req, res) => {
  const sql = "DELETE FROM cpmk WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Gagal hapus (Data sedang digunakan)" });
    return res.json({ Status: "Success" });
  });
});

// --- SUB-CPMK ---
router.get("/subcpmk", (req, res) => {
  const sql = `
        SELECT sub_cpmk.id, sub_cpmk.cpmk_id, sub_cpmk.kode_sub_cpmk, sub_cpmk.deskripsi, cpmk.kode_cpmk 
        FROM sub_cpmk 
        JOIN cpmk ON sub_cpmk.cpmk_id = cpmk.id
        ORDER BY sub_cpmk.kode_sub_cpmk ASC
    `;
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get Sub-CPMK Error" });
    return res.json(result);
  });
});

router.post("/subcpmk", (req, res) => {
  const { cpmk_id, kode_sub_cpmk, deskripsi } = req.body;
  const sql =
    "INSERT INTO sub_cpmk (cpmk_id, kode_sub_cpmk, deskripsi) VALUES (?, ?, ?)";
  db.query(sql, [cpmk_id, kode_sub_cpmk, deskripsi], (err, result) => {
    if (err) return res.json({ Error: "Insert Sub-CPMK Error" });
    return res.json({ Status: "Success" });
  });
});

app.delete("/api/subcpmk/:id", (req, res) => {
  const sql = "DELETE FROM sub_cpmk WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Gagal hapus (Data sedang digunakan)" });
    return res.json({ Status: "Success" });
  });
});

// --- DOSEN ---
router.get("/dosen", (req, res) => {
  const sql =
    "SELECT id, name, email FROM users WHERE role = 'dosen' ORDER BY name ASC";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get Dosen Error" });
    return res.json(result);
  });
});

router.post("/dosen", (req, res) => {
  const { name, email, password } = req.body;
  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'dosen')";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.json({ Error: "Email sudah terdaftar!" });
      return res.json({ Error: "Insert Dosen Error" });
    }
    return res.json({ Status: "Success" });
  });
});

router.delete("/dosen/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Delete Error" });
    return res.json({ Status: "Success" });
  });
});

module.exports = router;
