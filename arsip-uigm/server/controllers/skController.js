const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// 1. GET ALL SK 
exports.getAllSK = async (req, res) => {
    try {
        const { 
            page = 1, limit = 10, search = '', 
            bulan = '', tahun = '', 
            jenis_sk = '' 
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Base Query
        let baseQuery = `
            FROM dokumen_sk dsk
            LEFT JOIN jenis_sk jsk ON dsk.id_jenis_sk = jsk.sk_id
            LEFT JOIN dokumen_sk_files dskf ON dsk.id = dskf.id_sk
            LEFT JOIN bagian bg ON dsk.asal_surat_sk = bg.bagian_id
            WHERE 1=1
        `;

        const queryParams = [];

        // --- FILTERING ---
        if (search) {
            baseQuery += ` AND (dsk.nomor_sk LIKE ? OR dsk.perihal_sk LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        if (bulan) {
            baseQuery += ` AND MONTH(dsk.tanggal_sk) = ?`;
            queryParams.push(bulan);
        }
        if (tahun) {
            baseQuery += ` AND YEAR(dsk.tanggal_sk) = ?`;
            queryParams.push(tahun);
        }
        if (jenis_sk) {
            baseQuery += ` AND dsk.id_jenis_sk = ?`;
            queryParams.push(jenis_sk);
        }

        // --- HITUNG TOTAL DATA (Pagination) ---
        const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
        const [countResult] = await db.query(countSql, queryParams);
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        // --- AMBIL DATA ---
        const dataSql = `
            SELECT 
                dsk.*, 
                jsk.sk_nama_jenis AS nama_jenis_sk,
                dskf.path_file_sk,
                dskf.nama_file_asli_sk,
                bg.nama_bagian as nama_asal_surat
            ${baseQuery}
            ORDER BY dsk.tanggal_sk DESC
            LIMIT ? OFFSET ?
        `;

        const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];
        const [rows] = await db.query(dataSql, dataParams);

        res.json({
            data: rows,
            pagination: { 
                totalRecords, 
                totalPages, 
                currentPage: parseInt(page), 
                limit: parseInt(limit) 
            }
        });

    } catch (error) {
        console.error("ERROR GET SK:", error);
        res.status(500).json({ message: "Gagal mengambil data SK", error: error.message });
    }
};

exports.getSKById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT 
                dsk.*, 
                dskf.path_file_sk, 
                dskf.nama_file_asli_sk,
                jsk.sk_nama_jenis AS nama_jenis_sk,
                bg.nama_bagian AS nama_asal_surat
            FROM dokumen_sk dsk
            LEFT JOIN dokumen_sk_files dskf ON dsk.id = dskf.id_sk
            LEFT JOIN jenis_sk jsk ON dsk.id_jenis_sk = jsk.sk_id
            LEFT JOIN bagian bg ON dsk.asal_surat_sk = bg.bagian_id
            WHERE dsk.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "SK tidak ditemukan" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error server", error: error.message });
    }
};

exports.createSK = async (req, res) => {
    const connection = await db.getConnection();
    const file = req.file;
    const pengunggahId = req.user ? req.user.id : 1; 

    try {
        await connection.beginTransaction();
        const { 
            nomor_sk, perihal_sk, id_jenis_sk, asal_surat_sk, 
            tanggal_sk, lainnya_sk, sk_tanda_tangan, tujuan_sppd 
        } = req.body;

        const [existing] = await connection.query("SELECT id FROM dokumen_sk WHERE nomor_sk = ?", [nomor_sk]);
        if (existing.length > 0) throw new Error(`Nomor SK '${nomor_sk}' sudah terdaftar.`);

        const [result] = await connection.query(`
            INSERT INTO dokumen_sk 
            (id_jenis_sk, nomor_sk, perihal_sk, tanggal_sk, asal_surat_sk, lainnya_sk, sk_tanda_tangan, sk_pengunggah, tujuan_sppd, sk_waktu_unggah) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [id_jenis_sk, nomor_sk, perihal_sk, tanggal_sk, asal_surat_sk, lainnya_sk, sk_tanda_tangan, pengunggahId, tujuan_sppd]);

        const skId = result.insertId;

        if (file) {
            const dbPath = 'uploads/sk/' + file.filename;
            await connection.query("INSERT INTO dokumen_sk_files (id_sk, nama_file_asli_sk, path_file_sk) VALUES (?, ?, ?)", [skId, file.originalname, dbPath]);
        }

        await connection.commit();
        res.status(201).json({ message: "SK berhasil disimpan", id: skId });
    } catch (error) {
        await connection.rollback();
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        res.status(500).json({ message: "Gagal menyimpan SK", error: error.message });
    } finally {
        connection.release();
    }
};

exports.updateSK = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    const file = req.file;

    try {
        await connection.beginTransaction();
        const { 
            nomor_sk, perihal_sk, id_jenis_sk, asal_surat_sk, 
            tanggal_sk, lainnya_sk, sk_tanda_tangan, tujuan_sppd 
        } = req.body;

        const sqlUpdate = `
            UPDATE dokumen_sk SET 
                nomor_sk=?, perihal_sk=?, id_jenis_sk=?, asal_surat_sk=?, 
                tanggal_sk=?, lainnya_sk=?, sk_tanda_tangan=?, tujuan_sppd=?
            WHERE id=?
        `;
        const [resUpdate] = await connection.query(sqlUpdate, [
            nomor_sk, perihal_sk, id_jenis_sk, asal_surat_sk, 
            tanggal_sk, lainnya_sk, sk_tanda_tangan, tujuan_sppd, id
        ]);

        if (resUpdate.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Data SK tidak ditemukan" });
        }

        if (file) {
            const [oldFiles] = await connection.query("SELECT path_file_sk FROM dokumen_sk_files WHERE id_sk = ?", [id]);
            if (oldFiles.length > 0 && oldFiles[0].path_file_sk) {
                const oldPath = path.join(__dirname, '../public', oldFiles[0].path_file_sk);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            const dbPath = 'uploads/sk/' + file.filename;
            if (oldFiles.length > 0) {
                 await connection.query("UPDATE dokumen_sk_files SET path_file_sk=?, nama_file_asli_sk=? WHERE id_sk=?", [dbPath, file.originalname, id]);
            } else {
                 await connection.query("INSERT INTO dokumen_sk_files (id_sk, nama_file_asli_sk, path_file_sk) VALUES (?, ?, ?)", [id, file.originalname, dbPath]);
            }
        }

        await connection.commit();
        res.json({ message: "SK berhasil diperbarui" });
    } catch (error) {
        await connection.rollback();
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        res.status(500).json({ message: "Gagal update SK", error: error.message });
    } finally {
        connection.release();
    }
};

exports.deleteSK = async (req, res) => {
    const { id } = req.params;
    try {
        const [files] = await db.query('SELECT path_file_sk FROM dokumen_sk_files WHERE id_sk = ?', [id]);
        await db.query('DELETE FROM dokumen_sk_files WHERE id_sk = ?', [id]);
        const [resDel] = await db.query('DELETE FROM dokumen_sk WHERE id = ?', [id]);

        if (resDel.affectedRows === 0) return res.status(404).json({ message: "SK tidak ditemukan" });

        if (files.length > 0 && files[0].path_file_sk) {
            const filePath = path.join(__dirname, '../public', files[0].path_file_sk);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.json({ message: "SK berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus SK", error: error.message });
    }
};