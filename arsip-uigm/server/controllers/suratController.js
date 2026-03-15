const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// 1. GET ALL SURAT
exports.getAllSurat = async (req, res) => {
    try {
        const { 
            page = 1, limit = 10, search = '', 
            bulan = '', tahun = '', 
            jenis_surat = '', 
            sub_jenis = '' 
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let baseQuery = `
            FROM dokumen_surat ds
            LEFT JOIN dokumen_surat_files dsf ON ds.id = dsf.id_surat
            LEFT JOIN jenis_surat js ON ds.jenis_surat = js.surat_id
            LEFT JOIN jenis_surat_sub jss ON (
                jss.surat_id = ds.jenis_surat 
                AND ds.nomor_surat COLLATE utf8mb4_general_ci LIKE CONCAT('%', TRIM(jss.kode_surat), '%') COLLATE utf8mb4_general_ci
                AND TRIM(jss.kode_surat) != '' 
            )
            LEFT JOIN bagian b ON ds.asal_surat = b.bagian_id 
            LEFT JOIN bagian bt ON ds.tujuan_surat = bt.bagian_id
            WHERE 1=1
        `;
        
        const queryParams = [];

        if (search) {
            baseQuery += ` AND (ds.nomor_surat LIKE ? OR ds.surat_perihal LIKE ? OR bt.nama_bagian LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (bulan) {
            baseQuery += ` AND MONTH(ds.tanggal_surat) = ?`;
            queryParams.push(bulan);
        }
        if (tahun) {
            baseQuery += ` AND YEAR(ds.tanggal_surat) = ?`;
            queryParams.push(tahun);
        }
        if (jenis_surat) {
            baseQuery += ` AND ds.jenis_surat = ?`;
            queryParams.push(jenis_surat);
        }
        if (sub_jenis) {
            baseQuery += ` AND jss.sub_id = ?`;
            queryParams.push(sub_jenis);
        }

        const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
        const [countResult] = await db.query(countSql, queryParams);
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        const dataSql = `
            SELECT 
                ds.*, 
                dsf.path_file_surat,
                dsf.nama_file_asli_surat,
                js.surat_nama_jenis,
                jss.sub_nama_jenis,
                b.nama_bagian as nama_asal_surat,
                bt.nama_bagian as nama_tujuan_surat
            ${baseQuery}
            ORDER BY ds.tanggal_surat DESC
            LIMIT ? OFFSET ?
        `;
        
        const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];
        const [rows] = await db.query(dataSql, dataParams);

        res.json({
            data: rows,
            pagination: { totalRecords, totalPages, currentPage: parseInt(page), limit: parseInt(limit) }
        });

    } catch (error) {
        console.error("Error fetching surat:", error);
        res.status(500).json({ message: "Gagal mengambil data surat", error: error.message });
    }
};

// 2. GET SURAT BY ID
exports.getSuratById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT 
                ds.*, 
                dsf.path_file_surat, 
                dsf.nama_file_asli_surat,
                js.surat_nama_jenis,
                jss.sub_nama_jenis,
                b.nama_bagian as nama_asal_surat,
                bt.nama_bagian as nama_tujuan_surat
            FROM dokumen_surat ds
            LEFT JOIN dokumen_surat_files dsf ON ds.id = dsf.id_surat
            LEFT JOIN jenis_surat js ON ds.jenis_surat = js.surat_id
            LEFT JOIN jenis_surat_sub jss ON (
                jss.surat_id = ds.jenis_surat 
                AND ds.nomor_surat COLLATE utf8mb4_general_ci LIKE CONCAT('%', TRIM(jss.kode_surat), '%') COLLATE utf8mb4_general_ci
                AND TRIM(jss.kode_surat) != ''
            )
            LEFT JOIN bagian b ON ds.asal_surat = b.bagian_id
            LEFT JOIN bagian bt ON ds.tujuan_surat = bt.bagian_id
            WHERE ds.id = ?
        `;
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) return res.status(404).json({ message: "Surat tidak ditemukan" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil detail surat", error: error.message });
    }
};

// 3. CREATE SURAT 
exports.createSurat = async (req, res) => {
    const connection = await db.getConnection();
    const file = req.file;
    const pengunggahId = req.user ? req.user.id : null; 

    try {
        await connection.beginTransaction();

        const { 
            nomor_surat, jenis_surat, asal_surat, tujuan_surat, 
            surat_perihal, inti_surat, tanggal_surat, surat_lainnya,
            surat_tanda_tangan 
        } = req.body;

        if (!nomor_surat || !jenis_surat || !asal_surat) {
            throw new Error("Data wajib (Nomor, Jenis, Asal) harus diisi.");
        }

        const [result] = await connection.query(`
            INSERT INTO dokumen_surat 
            (
                nomor_surat, jenis_surat, asal_surat, tujuan_surat, 
                surat_perihal, inti_surat, tanggal_surat, 
                surat_lainnya, surat_tanda_tangan, surat_pengunggah, surat_waktu_unggah
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            nomor_surat, jenis_surat, asal_surat, tujuan_surat, 
            surat_perihal, inti_surat, tanggal_surat, 
            surat_lainnya, surat_tanda_tangan, pengunggahId
        ]);

        const suratId = result.insertId;

        if (file) {
            const dbPath = `uploads/surat/${file.filename}`; 
            
            await connection.query(`
                INSERT INTO dokumen_surat_files (id_surat, path_file_surat, nama_file_asli_surat)
                VALUES (?, ?, ?)
            `, [suratId, dbPath, file.originalname]);
        }

        await connection.commit();
        res.status(201).json({ message: "Surat berhasil disimpan", id: suratId });

    } catch (error) {
        await connection.rollback();
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        
        console.error("Gagal create surat:", error);
        res.status(500).json({ message: "Gagal menyimpan surat", error: error.message });
    } finally {
        connection.release();
    }
};

// 4. UPDATE SURAT
exports.updateSurat = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    const file = req.file; 
    
    const { 
        nomor_surat, jenis_surat, asal_surat, tujuan_surat, 
        surat_perihal, inti_surat, tanggal_surat, surat_lainnya,
        surat_tanda_tangan
    } = req.body;

    try {
        await connection.beginTransaction();
        const sql = `
            UPDATE dokumen_surat SET
                nomor_surat = ?,
                jenis_surat = ?,
                asal_surat = ?,
                tujuan_surat = ?,
                surat_perihal = ?,
                inti_surat = ?,
                tanggal_surat = ?,
                surat_lainnya = ?,
                surat_tanda_tangan = ?
            WHERE id = ?
        `;

        const [result] = await connection.query(sql, [
            nomor_surat, jenis_surat, asal_surat, tujuan_surat, 
            surat_perihal, inti_surat, tanggal_surat, surat_lainnya, 
            surat_tanda_tangan, id
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(404).json({ message: "Surat tidak ditemukan" });
        }

        // 2. Logika Ganti File 
        if (file) {
            // A. Cari file lama 
            const [oldFiles] = await connection.query(
                'SELECT path_file_surat FROM dokumen_surat_files WHERE id_surat = ?', 
                [id]
            );

            // B. Hapus fisik file lama
            if (oldFiles.length > 0 && oldFiles[0].path_file_surat) {
                const oldPath = path.join(__dirname, '../public', oldFiles[0].path_file_surat);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // C. Update path di database 
            const dbPath = `uploads/surat/${file.filename}`;
            
            if (oldFiles.length > 0) {
                await connection.query(`
                    UPDATE dokumen_surat_files 
                    SET path_file_surat = ?, nama_file_asli_surat = ? 
                    WHERE id_surat = ?
                `, [dbPath, file.originalname, id]);
            } else {
                await connection.query(`
                    INSERT INTO dokumen_surat_files (id_surat, path_file_surat, nama_file_asli_surat)
                    VALUES (?, ?, ?)
                `, [id, dbPath, file.originalname]);
            }
        }

        await connection.commit();
        res.json({ message: "Data surat dan file berhasil diperbarui" });

    } catch (error) {
        await connection.rollback();
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        
        console.error("Gagal update surat:", error);
        res.status(500).json({ message: "Gagal memperbarui data", error: error.message });
    } finally {
        connection.release();
    }
};

// 5. DELETE SURAT
exports.deleteSurat = async (req, res) => {
    const { id } = req.params;
    try {
        const [files] = await db.query('SELECT path_file_surat FROM dokumen_surat_files WHERE id_surat = ?', [id]);
        
        await db.query('DELETE FROM dokumen_surat_files WHERE id_surat = ?', [id]);
        const [result] = await db.query('DELETE FROM dokumen_surat WHERE id = ?', [id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Surat tidak ditemukan" });

        if (files.length > 0 && files[0].path_file_surat) {
            const filePath = path.join(__dirname, '../public', files[0].path_file_surat); 
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ message: "Surat berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus surat", error: error.message });
    }
};