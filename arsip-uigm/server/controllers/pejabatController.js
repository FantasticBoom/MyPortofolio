const db = require('../config/database');

// 1. Ambil Semua Pejabat
exports.getAllPejabat = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tanda_tangan ORDER BY status ASC, nama_pejabat ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pejabat", error: error.message });
    }
};

// 2. Tambah Pejabat Baru
exports.createPejabat = async (req, res) => {
    const { nama_pejabat, jabatan, status } = req.body;
    try {
        await db.query(
            'INSERT INTO tanda_tangan (nama_pejabat, jabatan, status) VALUES (?, ?, ?)',
            [nama_pejabat, jabatan, status || 'Aktif']
        );
        res.status(201).json({ message: "Pejabat berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambah pejabat", error: error.message });
    }
};

// 3. Update Pejabat
exports.updatePejabat = async (req, res) => {
    const { id } = req.params;
    const { nama_pejabat, jabatan, status } = req.body;
    try {
        await db.query(
            'UPDATE tanda_tangan SET nama_pejabat = ?, jabatan = ?, status = ? WHERE id = ?',
            [nama_pejabat, jabatan, status, id]
        );
        res.json({ message: "Data pejabat berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ message: "Gagal update pejabat", error: error.message });
    }
};

// 4. Hapus Pejabat
exports.deletePejabat = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tanda_tangan WHERE id = ?', [id]);
        res.json({ message: "Pejabat berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus pejabat", error: error.message });
    }
};