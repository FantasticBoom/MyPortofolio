const db = require('../config/database');
const bcrypt = require('bcryptjs');

// --- MANAGEMENT USERS ---

// 1. Ambil Semua User
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, user, nama_lengkap, role, foto_profil, created_at FROM users ORDER BY nama_lengkap ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data user", error: error.message });
    }
};

// 2. Tambah User Baru
exports.createUser = async (req, res) => {
    const { user, password, nama_lengkap, role } = req.body;
    
    try {
        // Cek apakah 'user' (username) sudah ada
        const [existing] = await db.query('SELECT * FROM users WHERE user = ?', [user]);
        if (existing.length > 0) return res.status(400).json({ message: "Username sudah digunakan!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Masukkan ke database
        await db.query(
            'INSERT INTO users (user, password, nama_lengkap, role) VALUES (?, ?, ?, ?)', 
            [user, hashedPassword, nama_lengkap, role || 'user']
        );

        res.status(201).json({ message: "User berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambah user", error: error.message });
    }
};

// 3. Update User
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { user, nama_lengkap, role, password } = req.body;

    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await db.query(
                'UPDATE users SET user = ?, password = ?, nama_lengkap = ?, role = ? WHERE id = ?',
                [user, hashedPassword, nama_lengkap, role, id]
            );
        } else {
            await db.query(
                'UPDATE users SET user = ?, nama_lengkap = ?, role = ? WHERE id = ?',
                [user, nama_lengkap, role, id]
            );
        }
        res.json({ message: "Data user berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: "Gagal update user", error: error.message });
    }
};

// 4. Hapus User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus user", error: error.message });
    }
};


// 1. BAGIAN (Unit Kerja)
exports.getAllBagian = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT bagian_id, nama_bagian, kode_bagian FROM bagian ORDER BY nama_bagian ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createBagian = async (req, res) => {
    const { nama_bagian, kode_bagian } = req.body;
    try {
        await db.query('INSERT INTO bagian (nama_bagian, kode_bagian) VALUES (?, ?)', [nama_bagian, kode_bagian]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateBagian = async (req, res) => {
    const { id } = req.params; 
    const { nama_bagian, kode_bagian } = req.body;
    try {
        await db.query('UPDATE bagian SET nama_bagian = ?, kode_bagian = ? WHERE bagian_id = ?', [nama_bagian, kode_bagian, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteBagian = async (req, res) => {
    try {
        await db.query('DELETE FROM bagian WHERE bagian_id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 2. TANDA TANGAN (id_ttd)
exports.getAllTTD = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT ttd_id, jabatan, nama_pejabat, NIDN, status FROM id_ttd ORDER BY nama_pejabat ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createTTD = async (req, res) => {
    const { jabatan, nama_pejabat, NIDN, status } = req.body;
    try {
        await db.query('INSERT INTO id_ttd (jabatan, nama_pejabat, NIDN, status) VALUES (?, ?, ?, ?)', [jabatan, nama_pejabat, NIDN, status]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateTTD = async (req, res) => {
    const { id } = req.params;
    const { jabatan, nama_pejabat, NIDN, status } = req.body;
    try {
        await db.query('UPDATE id_ttd SET jabatan=?, nama_pejabat=?, NIDN=?, status=? WHERE ttd_id=?', [jabatan, nama_pejabat, NIDN, status, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteTTD = async (req, res) => {
    try {
        await db.query('DELETE FROM id_ttd WHERE ttd_id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. JENIS SURAT
exports.getAllJenisSurat = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT surat_id, surat_nama_jenis, kode_surat, format_nomor FROM jenis_surat ORDER BY surat_nama_jenis ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createJenisSurat = async (req, res) => {
    const { surat_nama_jenis, kode_surat, format_nomor } = req.body;
    try {
        await db.query('INSERT INTO jenis_surat (surat_nama_jenis, kode_surat, format_nomor) VALUES (?, ?, ?)', [surat_nama_jenis, kode_surat, format_nomor]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateJenisSurat = async (req, res) => {
    const { id } = req.params;
    const { surat_nama_jenis, kode_surat, format_nomor } = req.body;
    try {
        await db.query('UPDATE jenis_surat SET surat_nama_jenis=?, kode_surat=?, format_nomor=? WHERE surat_id=?', [surat_nama_jenis, kode_surat, format_nomor, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteJenisSurat = async (req, res) => {
    try {
        await db.query('DELETE FROM jenis_surat WHERE surat_id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 4. JENIS SK
exports.getAllJenisSK = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT sk_id, sk_nama_jenis FROM jenis_sk ORDER BY sk_nama_jenis ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createJenisSK = async (req, res) => {
    const { sk_nama_jenis } = req.body;
    try {
        await db.query('INSERT INTO jenis_sk (sk_nama_jenis) VALUES (?)', [sk_nama_jenis]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateJenisSK = async (req, res) => {
    const { id } = req.params;
    const { sk_nama_jenis } = req.body;
    try {
        await db.query('UPDATE jenis_sk SET sk_nama_jenis=? WHERE sk_id=?', [sk_nama_jenis, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteJenisSK = async (req, res) => {
    try {
        await db.query('DELETE FROM jenis_sk WHERE sk_id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 5. JENIS SURAT SUB
exports.getAllJenisSuratSub = async (req, res) => {
    try {
        const sql = `
            SELECT s.*, j.surat_nama_jenis 
            FROM jenis_surat_sub s
            LEFT JOIN jenis_surat j ON s.surat_id = j.surat_id 
            ORDER BY s.sub_nama_jenis ASC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createJenisSuratSub = async (req, res) => {
    const { surat_id, sub_nama_jenis, kode_surat, format_surat } = req.body;
    try {
        await db.query('INSERT INTO jenis_surat_sub (surat_id, sub_nama_jenis, kode_surat, format_surat, created_at) VALUES (?, ?, ?, ?, NOW())', [surat_id, sub_nama_jenis, kode_surat, format_surat]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateJenisSuratSub = async (req, res) => {
    const { id } = req.params;
    const { surat_id, sub_nama_jenis, kode_surat, format_surat } = req.body;
    try {
        await db.query('UPDATE jenis_surat_sub SET surat_id=?, sub_nama_jenis=?, kode_surat=?, format_surat=? WHERE sub_id=?', [surat_id, sub_nama_jenis, kode_surat, format_surat, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteJenisSuratSub = async (req, res) => {
    try {
        await db.query('DELETE FROM jenis_surat_sub WHERE sub_id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 6. STRUKTURAL
exports.getAllStruktural = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM struktural ORDER BY nama ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createStruktural = async (req, res) => {
    const { jabatan, nama, nik, nitk, nidn, nuptk, nidk } = req.body;
    try {
        await db.query('INSERT INTO struktural (jabatan, nama, nik, nitk, nidn, nuptk, nidk) VALUES (?, ?, ?, ?, ?, ?, ?)', [jabatan, nama, nik, nitk, nidn, nuptk, nidk]);
        res.status(201).json({ message: "Berhasil disimpan" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateStruktural = async (req, res) => {
    const { id } = req.params;
    const { jabatan, nama, nik, nitk, nidn, nuptk, nidk } = req.body;
    try {
        await db.query('UPDATE struktural SET jabatan=?, nama=?, nik=?, nitk=?, nidn=?, nuptk=?, nidk=? WHERE id=?', [jabatan, nama, nik, nitk, nidn, nuptk, nidk, id]);
        res.json({ message: "Berhasil diupdate" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteStruktural = async (req, res) => {
    try {
        await db.query('DELETE FROM struktural WHERE id = ?', [req.params.id]);
        res.json({ message: "Berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};