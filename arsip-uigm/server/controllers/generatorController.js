const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const getRomanMonth = (monthIndex) => {
    const romans = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romans[monthIndex] || "";
};

// 1. GENERATE NOMOR SURAT
exports.generateNumber = async (req, res) => {
    const { surat_id, sub_id, bagian_id } = req.query; 

    try {
        const date = new Date();
        const thn = date.getFullYear();
        const bln = date.getMonth() + 1;

        let formatTemplate = "";
        let kodeSurat = "";

        if (sub_id && sub_id !== 'null' && sub_id !== 'undefined') {
            const [subData] = await db.query('SELECT format_nomor, kode_surat FROM jenis_surat_sub WHERE sub_id = ?', [sub_id]);
            if (subData.length > 0) {
                formatTemplate = subData[0].format_nomor || "{NO}/{KODE}/{THN}"; 
                kodeSurat = subData[0].kode_surat;
            }
        } else {
            const [mainData] = await db.query('SELECT format_nomor, kode_surat FROM jenis_surat WHERE surat_id = ?', [surat_id]);
            if (mainData.length > 0) {
                formatTemplate = mainData[0].format_nomor || "{NO}/{KODE}/{THN}";
                kodeSurat = mainData[0].kode_surat;
            }
        }

        let kodeBagianResult = "";
        let pejabatDetail = null;

        if (bagian_id) {
            const [dataBagian] = await db.query('SELECT kode_bagian, nama_bagian FROM bagian WHERE bagian_id = ?', [bagian_id]);
            if (dataBagian.length > 0) {
                kodeBagianResult = dataBagian[0].kode_bagian; 
                const namaJabatan = dataBagian[0].nama_bagian; 

                const [dataTTD] = await db.query('SELECT * FROM id_ttd WHERE jabatan = ? AND status = "Aktif" LIMIT 1', [namaJabatan]);
                if (dataTTD.length > 0) {
                    pejabatDetail = dataTTD[0]; 
                }
            }
        }

        let qCounter = 'SELECT MAX(nomor_urut) as last_no FROM transaksi_surat WHERE surat_id = ? AND tahun = ?';
        const [counterData] = await db.query(qCounter, [surat_id, thn]);
        const nextNo = (counterData[0].last_no || 0) + 1;

        const varNoRaw = nextNo.toString();
        const varNoPad = nextNo.toString().padStart(2, '0');
        const varBlnRom = getRomanMonth(bln);
        
        let finalNomor = formatTemplate
            .replace('{NO}', varNoRaw)           
            .replace('{NO_PAD}', varNoPad)       
            .replace('{KODE}', kodeSurat)        
            .replace('{KODE_BAGIAN}', kodeBagianResult) 
            .replace('{BLN_ROM}', varBlnRom)     
            .replace('{THN}', thn);              

        res.json({
            success: true,
            nomor_surat: finalNomor,
            data: {
                nomor_urut: nextNo,
                bulan: bln,
                tahun: thn,
                pejabat: pejabatDetail 
            }
        });

    } catch (error) {
        console.error("Generator Error:", error);
        res.status(500).json({ success: false, message: "Gagal generate nomor" });
    }
};

// 2. SIMPAN SURAT 
exports.saveSurat = async (req, res) => {
    const { 
        surat_id, sub_id, ttd_id, 
        nomor_surat, nomor_urut, bulan, tahun, 
        kepada, kepada_sub, perihal, isi_surat, tembusan, tanggal_surat 
    } = req.body;

    const userId = req.user ? req.user.id : null; 

    try {
        await db.query(
            `INSERT INTO transaksi_surat 
            (surat_id, sub_id, ttd_id, nomor_surat, nomor_urut, bulan, tahun, kepada, kepada_sub, perihal, isi_surat, tembusan, tanggal_surat, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [surat_id, sub_id || null, ttd_id, nomor_surat, nomor_urut, bulan, tahun, kepada, kepada_sub || null, perihal, isi_surat, tembusan || null, tanggal_surat, userId]
        );
        res.status(201).json({ success: true, message: "Surat berhasil disimpan" });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan surat", error: error.message });
    }
};

// 3. GET HISTORY
exports.getHistory = async (req, res) => {
    try {
        const query = `
            SELECT t.*, j.surat_nama_jenis, js.sub_nama_jenis,
            (SELECT COUNT(*) FROM dokumen_surat ds WHERE ds.nomor_surat COLLATE utf8mb4_general_ci = t.nomor_surat COLLATE utf8mb4_general_ci) as is_applied
            FROM transaksi_surat t
            JOIN jenis_surat j ON t.surat_id = j.surat_id
            LEFT JOIN jenis_surat_sub js ON t.sub_id = js.sub_id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Get History Error:", error); 
        res.status(500).json({ message: "Gagal ambil history", error: error.message });
    }
};

// 4. DELETE SURAT
exports.deleteSurat = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT file_path FROM transaksi_surat WHERE id = ?', [id]);
        
        await db.query('DELETE FROM transaksi_surat WHERE id = ?', [id]);

        if (rows.length > 0 && rows[0].file_path) {
            const fullPath = path.join(__dirname, '..', 'public', rows[0].file_path);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.json({ success: true, message: "Surat berhasil dihapus" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus surat" });
    }
};

// 5. UPLOAD SURAT
exports.uploadSurat = async (req, res) => {
    const { id } = req.body;
    const file = req.file; 

    if (!file) {
        return res.status(400).json({ success: false, message: "Tidak ada file yang diupload" });
    }

    try {
        const filePath = `/uploads/surat/${file.filename}`;
        await db.query('UPDATE transaksi_surat SET file_path = ? WHERE id = ?', [filePath, id]);

        res.json({ success: true, message: "File berhasil diupload", filePath });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: "Gagal update database file" });
    }
};

// 6. APPLY TO ARSIP
exports.applyToArsip = async (req, res) => {
    const { id } = req.body; 
    const userId = req.user ? req.user.id : 0; 
    
    try {
        const querySource = `
            SELECT t.*, p.jabatan
            FROM transaksi_surat t
            LEFT JOIN id_ttd p ON t.ttd_id = p.ttd_id
            WHERE t.id = ?
        `;
        const [source] = await db.query(querySource, [id]);

        if (source.length === 0) return res.status(404).json({ message: "Data surat tidak ditemukan" });
        const data = source[0];

        if (!data.file_path) return res.status(400).json({ message: "File PDF belum diupload!" });

        // --- 1. LOGIKA ASAL SURAT (Dari TTD -> Jabatan -> Bagian ID) ---
        let asalSuratId = 0;
        if (data.jabatan) {
            const [bagianResult] = await db.query(
                'SELECT bagian_id FROM bagian WHERE nama_bagian = ? LIMIT 1', 
                [data.jabatan]
            );
            
            if (bagianResult.length > 0) {
                asalSuratId = bagianResult[0].bagian_id;
            } else {
                console.warn("Warning: Tidak ditemukan bagian untuk jabatan: " + data.jabatan);
                const [fallbackBagian] = await db.query("SELECT bagian_id FROM bagian WHERE nama_bagian LIKE '%Lain%' LIMIT 1");
                asalSuratId = fallbackBagian.length > 0 ? fallbackBagian[0].bagian_id : 0;
            }
        }

        // --- 2. LOGIKA TUJUAN SURAT (Lookup dari Teks 'Kepada') ---
        let tujuanId = 0; 
        const textKepada = data.kepada ? data.kepada.trim() : ""; 

        if (textKepada) {
            const [match] = await db.query(
                'SELECT bagian_id FROM bagian WHERE LOWER(nama_bagian) = LOWER(?) LIMIT 1', 
                [textKepada]
            );

            if (match.length > 0) {
                tujuanId = match[0].bagian_id;
            } else {
                const [fallback] = await db.query(
                    "SELECT bagian_id FROM bagian WHERE nama_bagian LIKE '%Lain%' LIMIT 1"
                );
                if (fallback.length > 0) tujuanId = fallback[0].bagian_id;
            }
        }

        // --- 3. BERSIHKAN ISI SURAT ---
        let cleanText = data.isi_surat ? data.isi_surat.replace(/<[^>]+>/g, ' ') : ''; 
        let intiSurat = cleanText.length > 200 ? cleanText.substring(0, 200) + "..." : cleanText;

        // --- 4. INSERT KE ARSIP ---
        const insertDocQuery = `
            INSERT INTO dokumen_surat 
            (nomor_surat, jenis_surat, asal_surat, tujuan_surat, surat_perihal, inti_surat, tanggal_surat, surat_tanda_tangan, surat_pengunggah, surat_waktu_unggah, surat_lainnya)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `;

        const [resultDoc] = await db.query(insertDocQuery, [
            data.nomor_surat,        
            data.surat_id,           
            asalSuratId,            
            tujuanId,                
            data.perihal,            
            intiSurat,               
            data.tanggal_surat,      
            data.ttd_id,             
            userId,                  
            '-'                      
        ]);

        const newIdSurat = resultDoc.insertId;
        const fileName = path.basename(data.file_path);

        await db.query(
            `INSERT INTO dokumen_surat_files (id_surat, nama_file_asli_surat, path_file_surat) VALUES (?, ?, ?)`,
            [newIdSurat, fileName, data.file_path]
        );

        res.json({ success: true, message: "Surat berhasil diarsipkan (Applied)" });

    } catch (error) {
        console.error("Apply Error:", error);
        res.status(500).json({ success: false, message: "Gagal melakukan proses apply", error: error.message });
    }
};