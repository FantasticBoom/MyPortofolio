// routes/rps.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET DETAIL RPS (FIXED & LENGKAP)
router.get("/rps/detail/:id", (req, res) => {
  const rpsId = req.params.id;
  const qHeader =
    "SELECT rps.*, mata_kuliah.nama_mk, mata_kuliah.kode_mk, mata_kuliah.sks FROM rps JOIN mata_kuliah ON rps.mata_kuliah_id = mata_kuliah.id WHERE rps.id = ?";
  const qText = "SELECT * FROM rps_text_detail WHERE rps_id = ?";
  const qKorelasi = `
    SELECT k.sub_cpmk_id, k.cpl_id, k.persentase, s.kode_sub_cpmk AS kode_sub, c.kode_cpl AS kode_cpl_join
    FROM rps_korelasi_cpl k
    JOIN sub_cpmk s ON k.sub_cpmk_id = s.id
    JOIN cpl c ON k.cpl_id = c.id
    WHERE k.rps_id = ?`;
  const qPenilaian = `
        SELECT p.*, s.kode_sub_cpmk, s.deskripsi as deskripsi_sub
        FROM rps_detail_penilaian p
        JOIN sub_cpmk s ON p.sub_cpmk_id = s.id
        WHERE p.rps_id = ?`;

  const run = (query) =>
    new Promise((resolve, reject) => {
      db.query(query, [rpsId], (err, res) =>
        err ? reject(err) : resolve(res)
      );
    });

  Promise.all([run(qHeader), run(qText), run(qKorelasi), run(qPenilaian)])
    .then(([header, text, korelasi, penilaian]) => {
      if (header.length === 0) return res.json({ Error: "RPS Not Found" });
      const data = {
        ...header[0],
        bahan_kajian: text.filter((t) => t.kategori === "bahan_kajian"),
        pustaka_utama: text.filter((t) => t.kategori === "pustaka_utama"),
        pustaka_pendukung: text.filter(
          (t) => t.kategori === "pustaka_pendukung"
        ),
        korelasi: korelasi,
        penilaian: penilaian,
      };
      res.json(data);
    })
    .catch((err) => res.json({ Error: err.message }));
});

// 2. CREATE RPS
router.post("/rps", (req, res) => {
  const {
    mata_kuliah_id,
    dosen_id,
    semester,
    tahun_akademik,
    deskripsi_mk,
    mk_syarat,
    bahan_kajian,
    pustaka_utama,
    pustaka_pendukung,
    matrix_korelasi,
    rencana_penilaian,
  } = req.body;

  db.getConnection((err, connection) => {
    if (err) return res.json({ Error: "Db Connection Error" });
    connection.beginTransaction((err) => {
      if (err) return res.json({ Error: "Transaction Error" });

      const qRps =
        "INSERT INTO rps (mata_kuliah_id, dosen_id, semester, tahun_akademik, deskripsi_mk, mata_kuliah_syarat) VALUES (?,?,?,?,?,?)";
      connection.query(
        qRps,
        [
          mata_kuliah_id,
          dosen_id,
          semester,
          tahun_akademik,
          deskripsi_mk,
          mk_syarat,
        ],
        (err, result) => {
          if (err)
            return connection.rollback(() =>
              res.json({ Error: "Insert Header Failed" })
            );
          const rpsId = result.insertId;

          // Text Detail
          let textValues = [];
          if (bahan_kajian)
            bahan_kajian.forEach((t) =>
              textValues.push([rpsId, "bahan_kajian", t])
            );
          if (pustaka_utama)
            pustaka_utama.forEach((t) =>
              textValues.push([rpsId, "pustaka_utama", t])
            );
          if (pustaka_pendukung)
            pustaka_pendukung.forEach((t) =>
              textValues.push([rpsId, "pustaka_pendukung", t])
            );

          const runQuery = (query, values) =>
            new Promise((resolve, reject) => {
              if (!values || values.length === 0) return resolve();
              connection.query(query, [values], (err) =>
                err ? reject(err) : resolve()
              );
            });

          // Matrix & Penilaian
          const korelasiValues = matrix_korelasi.map((k) => [
            rpsId,
            k.sub_cpmk_id,
            k.cpl_id,
            k.persentase,
          ]);
          const penilaianValues = rencana_penilaian.map((p) => [
            rpsId,
            p.sub_cpmk_id,
            p.minggu_ke,
            p.bentuk_asesmen,
            p.bobot,
          ]);

          Promise.all([
            runQuery(
              "INSERT INTO rps_text_detail (rps_id, kategori, isi_teks) VALUES ?",
              textValues
            ),
            runQuery(
              "INSERT INTO rps_korelasi_cpl (rps_id, sub_cpmk_id, cpl_id, persentase) VALUES ?",
              korelasiValues
            ),
            runQuery(
              "INSERT INTO rps_detail_penilaian (rps_id, sub_cpmk_id, minggu_ke, bentuk_asesmen, bobot_penilaian) VALUES ?",
              penilaianValues
            ),
          ])
            .then(() => {
              connection.commit((err) => {
                if (err)
                  return connection.rollback(() =>
                    res.json({ Error: "Commit Error" })
                  );
                connection.release();
                res.json({ Status: "Success", rpsId: rpsId });
              });
            })
            .catch((err) => {
              connection.rollback(() => {
                connection.release();
                res.json({ Error: "Insert Detail Failed" });
              });
            });
        }
      );
    });
  });
});

// 3. UPDATE RPS (FIXED)
router.put("/rps/:id", (req, res) => {
  const rpsId = req.params.id;
  const {
    mata_kuliah_id,
    semester,
    tahun_akademik,
    deskripsi_mk,
    mk_syarat,
    bahan_kajian,
    pustaka_utama,
    pustaka_pendukung,
    matrix_korelasi,
    rencana_penilaian,
  } = req.body;

  db.getConnection((err, connection) => {
    if (err) return res.json({ Error: "Database Connection Failed" });
    connection.beginTransaction((err) => {
      if (err) return res.json({ Error: "Transaction Error" });

      const qUpdateHeader =
        "UPDATE rps SET mata_kuliah_id=?, semester=?, tahun_akademik=?, deskripsi_mk=?, mata_kuliah_syarat=? WHERE id=?";
      connection.query(
        qUpdateHeader,
        [
          mata_kuliah_id,
          semester,
          tahun_akademik,
          deskripsi_mk,
          mk_syarat,
          rpsId,
        ],
        (err, result) => {
          if (err)
            return connection.rollback(() =>
              res.json({ Error: "Update Header Failed" })
            );

          const qDelText = "DELETE FROM rps_text_detail WHERE rps_id = ?";
          const qDelKor = "DELETE FROM rps_korelasi_cpl WHERE rps_id = ?";
          const qDelNil = "DELETE FROM rps_detail_penilaian WHERE rps_id = ?";

          Promise.all([
            new Promise((resolve, reject) =>
              connection.query(qDelText, [rpsId], (err) =>
                err ? reject(err) : resolve()
              )
            ),
            new Promise((resolve, reject) =>
              connection.query(qDelKor, [rpsId], (err) =>
                err ? reject(err) : resolve()
              )
            ),
            new Promise((resolve, reject) =>
              connection.query(qDelNil, [rpsId], (err) =>
                err ? reject(err) : resolve()
              )
            ),
          ])
            .then(() => {
              let textValues = [];
              if (bahan_kajian)
                bahan_kajian.forEach((t) =>
                  textValues.push([rpsId, "bahan_kajian", t])
                );
              if (pustaka_utama)
                pustaka_utama.forEach((t) =>
                  textValues.push([rpsId, "pustaka_utama", t])
                );
              if (pustaka_pendukung)
                pustaka_pendukung.forEach((t) =>
                  textValues.push([rpsId, "pustaka_pendukung", t])
                );

              const korelasiValues = matrix_korelasi.map((k) => [
                rpsId,
                k.sub_cpmk_id,
                k.cpl_id,
                k.persentase,
              ]);
              const penilaianValues = rencana_penilaian.map((p) => [
                rpsId,
                p.sub_cpmk_id,
                p.minggu_ke,
                p.bentuk_asesmen,
                p.bobot,
              ]);

              const runQuery = (query, values) =>
                new Promise((resolve, reject) => {
                  if (!values || values.length === 0) return resolve();
                  connection.query(query, [values], (err) =>
                    err ? reject(err) : resolve()
                  );
                });

              Promise.all([
                runQuery(
                  "INSERT INTO rps_text_detail (rps_id, kategori, isi_teks) VALUES ?",
                  textValues
                ),
                runQuery(
                  "INSERT INTO rps_korelasi_cpl (rps_id, sub_cpmk_id, cpl_id, persentase) VALUES ?",
                  korelasiValues
                ),
                runQuery(
                  "INSERT INTO rps_detail_penilaian (rps_id, sub_cpmk_id, minggu_ke, bentuk_asesmen, bobot_penilaian) VALUES ?",
                  penilaianValues
                ),
              ])
                .then(() => {
                  connection.commit((err) => {
                    if (err)
                      return connection.rollback(() =>
                        res.json({ Error: "Commit Error" })
                      );
                    connection.release();
                    res.json({ Status: "Success" });
                  });
                })
                .catch((err) =>
                  connection.rollback(() => {
                    connection.release();
                    res.json({ Error: "Insert New Detail Failed" });
                  })
                );
            })
            .catch((err) =>
              connection.rollback(() => {
                connection.release();
                res.json({ Error: "Delete Old Detail Failed" });
              })
            );
        }
      );
    });
  });
});

// 4. GET LIST RPS BY DOSEN
router.get("/dosen/rps/:dosenId", (req, res) => {
  const sql =
    "SELECT rps.*, mata_kuliah.nama_mk, mata_kuliah.kode_mk FROM rps JOIN mata_kuliah ON rps.mata_kuliah_id = mata_kuliah.id WHERE dosen_id = ?";
  db.query(sql, [req.params.dosenId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

// 5. KELOLA KELAS & MAHASISWA
router.get("/rps/mahasiswa/:rpsId", (req, res) => {
  const sql = `SELECT km.id as km_id, m.id as mhs_id, m.nim, m.nama_lengkap FROM kelas_mahasiswa km JOIN mahasiswa m ON km.mahasiswa_id = m.id WHERE km.rps_id = ? ORDER BY m.nim ASC`;
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

router.get("/mahasiswa/available/:rpsId", (req, res) => {
  const sql = `SELECT m.id, m.nim, m.nama_lengkap FROM mahasiswa m LEFT JOIN kelas_mahasiswa km ON m.id = km.mahasiswa_id AND km.rps_id = ? WHERE m.status = 'Aktif' AND km.id IS NULL ORDER BY m.nim ASC`;
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json([]);
    return res.json(result);
  });
});

router.post("/kelas/add", (req, res) => {
  const { rps_id, mahasiswa_id } = req.body;
  const sql =
    "INSERT INTO kelas_mahasiswa (rps_id, mahasiswa_id) VALUES (?, ?)";
  db.query(sql, [rps_id, mahasiswa_id], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json({ Status: "Success" });
  });
});

router.delete("/kelas/remove/:id", (req, res) => {
  const sql = "DELETE FROM kelas_mahasiswa WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json({ Status: "Success" });
  });
});

module.exports = router;
