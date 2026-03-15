const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi Database
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "obe_system_db",
});

// Login
app.post("/api/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) {
      // --- TAMBAHKAN BARIS INI ---
      console.log("-----------------------");
      console.log("ERROR DATABASE:", err); // Agar error muncul di Terminal VS Code
      console.log("-----------------------");
      // ---------------------------
      return res.json({ Error: "Login error in server" });
    }
    if (result.length > 0) {
      return res.json({
        Status: "Success",
        Role: result[0].role,
        User: result[0],
      });
    } else {
      return res.json({ Error: "Email atau Password salah" });
    }
  });
});

// Get Data Mata Kuliah
app.get("/api/matakuliah", (req, res) => {
  const sql = "SELECT * FROM mata_kuliah";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get MK Error" });
    return res.json(result);
  });
});

// Tambah Mata Kuliah
app.post("/api/matakuliah", (req, res) => {
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

// --- API CPL ---
app.get("/api/cpl", (req, res) => {
  db.query("SELECT * FROM cpl", (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});
app.post("/api/cpl", (req, res) => {
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
  const id = req.params.id;
  // Cek dulu apakah CPL ini dipakai di tabel lain (opsional, tapi aman)
  const sql = "DELETE FROM cpl WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      // Error biasanya karena Foreign Key (Data sedang dipakai di RPS/Korelasi)
      console.error("Delete Error:", err);
      return res.json({
        Error: "Gagal menghapus! Data CPL ini sedang digunakan.",
      });
    }
    return res.json({ Status: "Success" });
  });
});

// --- API CPMK ---
app.get("/api/cpmk", (req, res) => {
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

// 2. Tambah CPMK
app.post("/api/cpmk", (req, res) => {
  const { mata_kuliah_id, kode_cpmk, deskripsi } = req.body;
  const sql =
    "INSERT INTO cpmk (mata_kuliah_id, kode_cpmk, deskripsi) VALUES (?, ?, ?)";
  db.query(sql, [mata_kuliah_id, kode_cpmk, deskripsi], (err, result) => {
    if (err) return res.json({ Error: "Insert CPMK Error" });
    return res.json({ Status: "Success" });
  });
});

app.delete("/api/cpmk/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM cpmk WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Error: "Gagal menghapus! Data CPMK ini sedang digunakan.",
      });
    return res.json({ Status: "Success" });
  });
});

// --- API SUB-CPMK ---
app.get("/api/subcpmk", (req, res) => {
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

// 2. Tambah Sub-CPMK
app.post("/api/subcpmk", (req, res) => {
  const { cpmk_id, kode_sub_cpmk, deskripsi } = req.body;
  const sql =
    "INSERT INTO sub_cpmk (cpmk_id, kode_sub_cpmk, deskripsi) VALUES (?, ?, ?)";
  db.query(sql, [cpmk_id, kode_sub_cpmk, deskripsi], (err, result) => {
    if (err) return res.json({ Error: "Insert Sub-CPMK Error" });
    return res.json({ Status: "Success" });
  });
});

app.delete("/api/subcpmk/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM sub_cpmk WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err)
      return res.json({
        Error: "Gagal menghapus! Data Sub-CPMK ini sedang digunakan.",
      });
    return res.json({ Status: "Success" });
  });
});

// 1. Ambil Semua Data Mahasiswa
app.get("/api/mahasiswa", (req, res) => {
  const sql = "SELECT * FROM mahasiswa ORDER BY nim ASC";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get Mahasiswa Error" });
    return res.json(result);
  });
});

// 2. Tambah Mahasiswa Baru
app.post("/api/mahasiswa", (req, res) => {
  const { nim, nama_lengkap, tahun_masuk, status } = req.body;

  // Cek duplikasi NIM (Opsional tapi disarankan)
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

// 3. Hapus Mahasiswa
app.delete("/api/mahasiswa/:id", (req, res) => {
  const sql = "DELETE FROM mahasiswa WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Delete Error" });
    return res.json({ Status: "Success" });
  });
});

// 1. Ambil Data User Khusus Dosen
app.get("/api/dosen", (req, res) => {
  // Filter hanya user yang role-nya 'dosen'
  const sql =
    "SELECT id, name, email FROM users WHERE role = 'dosen' ORDER BY name ASC";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Error: "Get Dosen Error" });
    return res.json(result);
  });
});

// 2. Tambah Akun Dosen Baru
app.post("/api/dosen", (req, res) => {
  const { name, email, password } = req.body;

  // Default role otomatis di-set 'dosen'
  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'dosen')";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      // Error code 1062 biasanya untuk duplicate entry (email sama)
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({ Error: "Email sudah terdaftar!" });
      }
      return res.json({ Error: "Insert Dosen Error" });
    }
    return res.json({ Status: "Success" });
  });
});

// 3. Hapus Akun Dosen
app.delete("/api/dosen/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: "Delete Error" });
    return res.json({ Status: "Success" });
  });
});

// --- API DASHBOARD STATS ---
app.get("/api/dashboard/stats", (req, res) => {
  // Kita gunakan Promise.all untuk menjalankan beberapa query sekaligus agar efisien
  const qTotalMhs = "SELECT COUNT(*) as total FROM mahasiswa";
  const qMhsAktif =
    "SELECT COUNT(*) as total FROM mahasiswa WHERE status = 'Aktif'";
  const qMhsLulus =
    "SELECT COUNT(*) as total FROM mahasiswa WHERE status = 'Lulus'";

  // Query Dummy untuk Penilaian (Karena tabel penilaian belum ada isinya)
  const qTotalNilai = "SELECT 0 as total";

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

// 1. Simpan RPS Baru (Complex Transaction)
app.post("/api/rps", async (req, res) => {
  const {
    mata_kuliah_id,
    dosen_id,
    semester,
    tahun_akademik,
    deskripsi_mk,
    mk_syarat, // Info Dasar
    bahan_kajian,
    pustaka_utama,
    pustaka_pendukung, // Arrays
    matrix_korelasi, // Array of Objects {sub_cpmk_id, cpl_id, persentase}
    rencana_penilaian, // Array of Objects {sub_cpmk_id, minggu, asesmen, bobot}
  } = req.body;

  // Gunakan Transaction agar jika satu gagal, semua batal (Manual logic for mysql2)
  db.getConnection((err, connection) => {
    if (err) return res.json({ Error: "Db Connection Error" });

    connection.beginTransaction((err) => {
      if (err) return res.json({ Error: "Transaction Error" });

      // A. Insert Header RPS
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
              res.json({ Error: "Insert RPS Header Failed" })
            );

          const rpsId = result.insertId;

          // B. Insert Text Detail (Looping)
          // Gabungkan semua text array menjadi satu proses insert untuk efisiensi
          let textValues = [];
          bahan_kajian.forEach((t) =>
            textValues.push([rpsId, "bahan_kajian", t])
          );
          pustaka_utama.forEach((t) =>
            textValues.push([rpsId, "pustaka_utama", t])
          );
          pustaka_pendukung.forEach((t) =>
            textValues.push([rpsId, "pustaka_pendukung", t])
          );

          const qText =
            "INSERT INTO rps_text_detail (rps_id, kategori, isi_teks) VALUES ?";
          connection.query(qText, [textValues], (err) => {
            if (err && textValues.length > 0)
              return connection.rollback(() =>
                res.json({ Error: "Insert Text Failed" })
              );

            // C. Insert Korelasi Matrix
            // Data bentuk: [[rpsId, subId, cplId, persen], ...]
            const korelasiValues = matrix_korelasi.map((k) => [
              rpsId,
              k.sub_cpmk_id,
              k.cpl_id,
              k.persentase,
            ]);
            const qKorelasi =
              "INSERT INTO rps_korelasi_cpl (rps_id, sub_cpmk_id, cpl_id, persentase) VALUES ?";

            const pKorelasi = new Promise((resolve, reject) => {
              if (korelasiValues.length === 0) resolve();
              connection.query(qKorelasi, [korelasiValues], (err) =>
                err ? reject(err) : resolve()
              );
            });

            // D. Insert Rencana Penilaian
            const penilaianValues = rencana_penilaian.map((p) => [
              rpsId,
              p.sub_cpmk_id,
              p.minggu_ke,
              p.bentuk_asesmen,
              p.bobot,
            ]);
            const qPenilaian =
              "INSERT INTO rps_detail_penilaian (rps_id, sub_cpmk_id, minggu_ke, bentuk_asesmen, bobot_penilaian) VALUES ?";

            const pPenilaian = new Promise((resolve, reject) => {
              if (penilaianValues.length === 0) resolve();
              connection.query(qPenilaian, [penilaianValues], (err) =>
                err ? reject(err) : resolve()
              );
            });

            // Execute Promises
            Promise.all([pKorelasi, pPenilaian])
              .then(() => {
                connection.commit((err) => {
                  if (err)
                    return connection.rollback(() =>
                      res.json({ Error: "Commit Error" })
                    );
                  res.json({ Status: "Success", rpsId: rpsId });
                });
              })
              .catch((err) => {
                connection.rollback(() =>
                  res.json({ Error: "Insert Detail Failed" })
                );
              });
          });
        }
      );
    });
  });
});

// 2. Get Data RPS milik Dosen tertentu
app.get("/api/dosen/rps/:dosenId", (req, res) => {
  const sql =
    "SELECT rps.*, mata_kuliah.nama_mk, mata_kuliah.kode_mk FROM rps JOIN mata_kuliah ON rps.mata_kuliah_id = mata_kuliah.id WHERE dosen_id = ?";
  db.query(sql, [req.params.dosenId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

app.post("/api/rps", (req, res) => {
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

  // 1. Mulai Transaksi Database
  db.getConnection((err, connection) => {
    if (err) return res.json({ Error: "Database Connection Failed" });

    connection.beginTransaction((err) => {
      if (err) return res.json({ Error: "Transaction Error" });

      // A. Insert Header RPS
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
              res.json({ Error: "Insert RPS Header Failed: " + err.message })
            );

          const rpsId = result.insertId; // Ambil ID RPS yang baru dibuat

          // B. Siapkan Data Text Detail (Bahan Kajian & Pustaka)
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

          // Helper Function untuk menjalankan Query Promise
          const runQuery = (query, values) => {
            return new Promise((resolve, reject) => {
              if (!values || values.length === 0) return resolve();
              connection.query(query, [values], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          };

          // C. Eksekusi Insert Detail Secara Paralel
          const qText =
            "INSERT INTO rps_text_detail (rps_id, kategori, isi_teks) VALUES ?";

          // Siapkan Data Matrix Korelasi
          const korelasiValues = matrix_korelasi.map((k) => [
            rpsId,
            k.sub_cpmk_id,
            k.cpl_id,
            k.persentase,
          ]);
          const qKorelasi =
            "INSERT INTO rps_korelasi_cpl (rps_id, sub_cpmk_id, cpl_id, persentase) VALUES ?";

          // Siapkan Data Penilaian
          const penilaianValues = rencana_penilaian.map((p) => [
            rpsId,
            p.sub_cpmk_id,
            p.minggu_ke,
            p.bentuk_asesmen,
            p.bobot,
          ]);
          const qPenilaian =
            "INSERT INTO rps_detail_penilaian (rps_id, sub_cpmk_id, minggu_ke, bentuk_asesmen, bobot_penilaian) VALUES ?";

          // Jalankan semua insert
          Promise.all([
            runQuery(qText, textValues),
            runQuery(qKorelasi, korelasiValues),
            runQuery(qPenilaian, penilaianValues),
          ])
            .then(() => {
              // Jika semua sukses, COMMIT (Simpan permanen)
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
              // Jika ada satu saja yang gagal, ROLLBACK (Batalkan semua)
              connection.rollback(() => {
                connection.release();
                res.json({ Error: "Insert Detail Failed: " + err.message });
              });
            });
        }
      );
    });
  });
});

// --- API GET DETAIL RPS (LENGKAP & FIXED) ---
app.get("/api/rps/detail/:id", (req, res) => {
  const rpsId = req.params.id;

  const qHeader =
    "SELECT rps.*, mata_kuliah.nama_mk, mata_kuliah.kode_mk, mata_kuliah.sks FROM rps JOIN mata_kuliah ON rps.mata_kuliah_id = mata_kuliah.id WHERE rps.id = ?";

  const qText = "SELECT * FROM rps_text_detail WHERE rps_id = ?";

  // PERBAIKAN DISINI: Menambahkan k.sub_cpmk_id dan k.cpl_id agar bisa dibaca frontend
  const qKorelasi = `
    SELECT 
        k.sub_cpmk_id,
        k.cpl_id,
        k.persentase,
        s.kode_sub_cpmk AS kode_sub,
        c.kode_cpl AS kode_cpl_join
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
    .catch((err) => {
      res.json({ Error: err.message });
    });
});

// --- API UPDATE RPS (PUT) ---
app.put("/api/rps/:id", (req, res) => {
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

      // 1. UPDATE Header RPS
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

          // 2. DELETE Detail Lama (Bersihkan data detail sebelumnya)
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
              // 3. INSERT Detail Baru (Sama seperti logika Create)

              // A. Text Detail
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

              // B. Matrix & Penilaian
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

              // Helper Run Query
              const runQuery = (query, values) => {
                return new Promise((resolve, reject) => {
                  if (!values || values.length === 0) return resolve();
                  connection.query(query, [values], (err) =>
                    err ? reject(err) : resolve()
                  );
                });
              };

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
                .catch((err) => {
                  connection.rollback(() => {
                    connection.release();
                    res.json({ Error: "Insert New Detail Failed" });
                  });
                });
            })
            .catch((err) => {
              connection.rollback(() => {
                connection.release();
                res.json({ Error: "Delete Old Detail Failed" });
              });
            });
        }
      );
    });
  });
});

// --- API HAPUS RPS (DELETE) ---
app.delete("/api/rps/:id", (req, res) => {
  const rpsId = req.params.id;

  db.getConnection((err, connection) => {
    if (err) return res.json({ Error: "Database Connection Failed" });

    connection.beginTransaction((err) => {
      if (err) return res.json({ Error: "Transaction Error" });

      // Urutan Hapus: Tabel Anak -> Tabel Parent (RPS)
      const tablesToDelete = [
        "nilai_mahasiswa",
        "kelas_mahasiswa",
        "rps_detail_penilaian",
        "rps_korelasi_cpl",
        "rps_text_detail",
      ];

      const deletePromises = tablesToDelete.map((table) => {
        return new Promise((resolve, reject) => {
          connection.query(
            `DELETE FROM ${table} WHERE rps_id = ?`,
            [rpsId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(deletePromises)
        .then(() => {
          // Setelah anak-anaknya bersih, baru hapus Header RPS
          const qHeader = "DELETE FROM rps WHERE id = ?";
          connection.query(qHeader, [rpsId], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.json({ Error: "Gagal menghapus Header RPS" });
              });
            }
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.json({ Error: "Commit Error" });
                });
              }
              connection.release();
              res.json({ Status: "Success" });
            });
          });
        })
        .catch((err) => {
          connection.rollback(() => {
            connection.release();
            console.log(err);
            res.json({ Error: "Gagal menghapus detail data RPS" });
          });
        });
    });
  });
});

// ==========================================
// API KELOLA KELAS & MAHASISWA
// ==========================================

// 1. Ambil Mahasiswa yang SUDAH masuk ke kelas ini (Tampil di Tabel Kanan)
app.get("/api/rps/mahasiswa/:rpsId", (req, res) => {
  const sql = `
        SELECT km.id as km_id, m.id as mhs_id, m.nim, m.nama_lengkap 
        FROM kelas_mahasiswa km
        JOIN mahasiswa m ON km.mahasiswa_id = m.id
        WHERE km.rps_id = ?
        ORDER BY m.nim ASC`;
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

// 2. Ambil Mahasiswa 'Aktif' yang BELUM masuk kelas ini (Untuk Dropdown Tambah)
app.get("/api/mahasiswa/available/:rpsId", (req, res) => {
  const rpsId = req.params.rpsId;

  // Logika: Ambil semua Mhs Aktif, gabungkan dengan data kelas saat ini.
  // Jika km.id NULL, artinya mahasiswa tersebut BELUM masuk ke kelas ini.
  const sql = `
        SELECT m.id, m.nim, m.nama_lengkap 
        FROM mahasiswa m
        LEFT JOIN kelas_mahasiswa km ON m.id = km.mahasiswa_id AND km.rps_id = ?
        WHERE m.status = 'Aktif' 
        AND km.id IS NULL
        ORDER BY m.nim ASC
    `;

  db.query(sql, [rpsId], (err, result) => {
    if (err) {
      console.error("Error Query Mahasiswa Available:", err);
      return res.json([]);
    }
    return res.json(result);
  });
});

// 3. Tambah Mahasiswa ke Kelas
app.post("/api/kelas/add", (req, res) => {
  const { rps_id, mahasiswa_id } = req.body;
  const sql =
    "INSERT INTO kelas_mahasiswa (rps_id, mahasiswa_id) VALUES (?, ?)";
  db.query(sql, [rps_id, mahasiswa_id], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json({ Status: "Success" });
  });
});

// 4. Hapus Mahasiswa dari Kelas
app.delete("/api/kelas/remove/:id", (req, res) => {
  const sql = "DELETE FROM kelas_mahasiswa WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json({ Status: "Success" });
  });
});

// ==========================================
// API PENILAIAN
// ==========================================

// 1. Ambil Nilai Existing
app.get("/api/nilai/:rpsId", (req, res) => {
  const sql = "SELECT * FROM nilai_mahasiswa WHERE rps_id = ?";
  db.query(sql, [req.params.rpsId], (err, result) => {
    if (err) return res.json({ Error: err });
    return res.json(result);
  });
});

// 2. Simpan Nilai (Auto Save per Cell)
app.post("/api/nilai/save", (req, res) => {
  const { rps_id, mahasiswa_id, sub_cpmk_id, nilai } = req.body;

  // Cek dulu apakah nilai sudah ada?
  const checkSql =
    "SELECT id FROM nilai_mahasiswa WHERE rps_id = ? AND mahasiswa_id = ? AND sub_cpmk_id = ?";
  db.query(checkSql, [rps_id, mahasiswa_id, sub_cpmk_id], (err, data) => {
    if (err) return res.json({ Error: err });

    if (data.length > 0) {
      // Update
      db.query(
        "UPDATE nilai_mahasiswa SET nilai = ? WHERE id = ?",
        [nilai, data[0].id],
        (err) => {
          if (err) return res.json({ Error: err });
          return res.json({ Status: "Success" });
        }
      );
    } else {
      // Insert
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

// --- API STRUKTUR PENILAIAN LENGKAP (CPL -> CPMK -> SUB) ---
app.get("/api/nilai/structure/:rpsId", (req, res) => {
  const rpsId = req.params.rpsId;

  // Logika: Ambil data korelasi yang persentasenya > 0 saja.
  // Urutkan berdasarkan CPL agar grouping di frontend rapi.
  const sql = `
        SELECT 
            k.id as korelasi_id, 
            k.persentase,
            c.id as cpl_id, 
            c.kode_cpl, 
            s.id as sub_cpmk_id, 
            s.kode_sub_cpmk
        FROM rps_korelasi_cpl k
        JOIN cpl c ON k.cpl_id = c.id
        JOIN sub_cpmk s ON k.sub_cpmk_id = s.id
        WHERE k.rps_id = ? AND k.persentase > 0
        ORDER BY c.kode_cpl ASC, s.kode_sub_cpmk ASC
    `;

  db.query(sql, [rpsId], (err, result) => {
    if (err) {
      console.error("Error Structure:", err);
      return res.json({ Error: err });
    }
    return res.json(result);
  });
});

// Running Server
app.listen(8081, () => {
  console.log("Server berjalan di port 8081");
});
