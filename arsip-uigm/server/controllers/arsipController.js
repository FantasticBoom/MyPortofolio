const db = require('../config/database');

// 1. Ambil Jenis Surat
exports.getJenisSurat = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT surat_id, surat_nama_jenis FROM jenis_surat ORDER BY surat_nama_jenis ASC");
        res.json({ status: "success", data: rows });
    } catch (error) {
        console.error("Error getJenisSurat:", error);
        res.status(500).json({ message: "Gagal ambil jenis surat", error: error.message });
    }
};

// 2. Ambil Jenis SK
exports.getJenisSK = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT sk_id, sk_nama_jenis FROM jenis_sk ORDER BY sk_nama_jenis ASC");
        res.json({ status: "success", data: rows });
    } catch (error) {
        console.error("Error getJenisSK:", error);
        res.status(500).json({ message: "Gagal ambil jenis SK", error: error.message });
    }
};

// 3. Pencarian Arsip
exports.searchArsip = async (req, res) => {
    try {
        const { q, kategori, jenis_id, start_date, end_date } = req.query;
        const FK_SURAT = 'jenis_surat'; 
        const FK_SK    = 'id_jenis_sk'; 
        
        let queryParams = [];
        let sqlSurat = `
            SELECT 
                ds.id, 
                ds.nomor_surat AS nomor, 
                ds.surat_perihal AS perihal, 
                ds.tanggal_surat AS tanggal, 
                'Surat' AS kategori, 
                js.surat_nama_jenis AS nama_jenis, 
                ds.surat_waktu_unggah AS created_at
            FROM dokumen_surat ds
            LEFT JOIN jenis_surat js ON ds.${FK_SURAT} = js.surat_id 
            WHERE 1=1
        `;

        // Filter Keyword
        if (q) {
            sqlSurat += ` AND (ds.nomor_surat LIKE ? OR ds.surat_perihal LIKE ?)`;
            queryParams.push(`%${q}%`, `%${q}%`);
        }
        // Filter Tanggal
        if (start_date && end_date) {
            sqlSurat += ` AND ds.tanggal_surat BETWEEN ? AND ?`;
            queryParams.push(start_date, end_date);
        }
        // Filter Dropdown Jenis Surat
        if (kategori === 'Surat' && jenis_id) {
            sqlSurat += ` AND ds.${FK_SURAT} = ?`;
            queryParams.push(jenis_id);
        }

        // QUERY SK
        let sqlSK = `
            SELECT 
                dk.id, 
                dk.nomor_sk AS nomor, 
                dk.perihal_sk AS perihal, 
                dk.tanggal_sk AS tanggal, 
                'SK' AS kategori, 
                jsk.sk_nama_jenis AS nama_jenis,
                dk.sk_waktu_unggah AS created_at
            FROM dokumen_sk dk
            LEFT JOIN jenis_sk jsk ON dk.${FK_SK} = jsk.sk_id
            WHERE 1=1
        `;

        let paramsSurat = [...queryParams];
        let paramsSK = [];

        // Filter Keyword
        if (q) {
            sqlSK += ` AND (dk.nomor_sk LIKE ? OR dk.perihal_sk LIKE ?)`;
            paramsSK.push(`%${q}%`, `%${q}%`);
        }
        // Filter Tanggal
        if (start_date && end_date) {
            sqlSK += ` AND dk.tanggal_sk BETWEEN ? AND ?`;
            paramsSK.push(start_date, end_date);
        }
        // Filter Dropdown Jenis SK
        if (kategori === 'SK' && jenis_id) {
            sqlSK += ` AND dk.${FK_SK} = ?`;
            paramsSK.push(jenis_id);
        }

        // EKSEKUSI GABUNGAN
        let finalSql = "";
        let finalParams = [];

        if (kategori === 'Surat') {
            finalSql = sqlSurat + ` ORDER BY tanggal DESC LIMIT 100`;
            finalParams = paramsSurat;
        } else if (kategori === 'SK') {
            finalSql = sqlSK + ` ORDER BY tanggal DESC LIMIT 100`;
            finalParams = paramsSK;
        } else {
            finalSql = `${sqlSurat} UNION ALL ${sqlSK} ORDER BY tanggal DESC LIMIT 100`;
            finalParams = [...paramsSurat, ...paramsSK];
        }

        const [rows] = await db.query(finalSql, finalParams);

        res.json({
            status: "success",
            total: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Error searchArsip:", error);
        res.status(500).json({ message: "Gagal mencari arsip", error: error.message });
    }
};