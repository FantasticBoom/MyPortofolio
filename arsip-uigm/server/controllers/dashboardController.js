const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Hitung Total Surat
        const [suratRows] = await db.query('SELECT COUNT(*) as total FROM dokumen_surat');
        const totalSurat = suratRows[0].total;

        // 2. Hitung Total SK
        const [skRows] = await db.query('SELECT COUNT(*) as total FROM dokumen_sk');
        const totalSK = skRows[0].total;

        // 3. Hitung Total Keseluruhan
        const totalArsip = totalSurat + totalSK;

        // 4. Data untuk Grafik Distribusi Jenis Surat
        const [jenisSuratStats] = await db.query(`
            SELECT js.surat_nama_jenis as nama_jenis, COUNT(ds.id) as jumlah
            FROM dokumen_surat ds
            LEFT JOIN jenis_surat js ON ds.jenis_surat = js.surat_id
            GROUP BY js.surat_nama_jenis
        `);

        // 5. Data untuk Grafik Distribusi Jenis SK
        const [jenisSkStats] = await db.query(`
            SELECT jsk.sk_nama_jenis as nama_jenis, COUNT(dsk.id) as jumlah
            FROM dokumen_sk dsk
            LEFT JOIN jenis_sk jsk ON dsk.id_jenis_sk = jsk.sk_id
            GROUP BY jsk.sk_nama_jenis
        `);

        // 6. 5 Aktivitas Terbaru / Dokumen Terbaru
        const [recentDocs] = await db.query(`
            (SELECT 'Surat' as kategori, nomor_surat as nomor, surat_perihal as perihal, tanggal_surat as tanggal, surat_waktu_unggah as created_at 
             FROM dokumen_surat)
            UNION ALL
            (SELECT 'SK' as kategori, nomor_sk as nomor, perihal_sk as perihal, tanggal_sk as tanggal, sk_waktu_unggah as created_at 
             FROM dokumen_sk)
            ORDER BY created_at DESC
            LIMIT 5
        `);

        res.json({
            cards: {
                total_arsip: totalArsip,
                total_surat: totalSurat,
                total_sk: totalSK
            },
            charts: {
                jenis_surat: jenisSuratStats,
                jenis_sk: jenisSkStats,
                komposisi: [
                    { label: 'Dokumen Surat', value: totalSurat },
                    { label: 'Dokumen SK', value: totalSK }
                ]
            },
            recent_activity: recentDocs
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Gagal memuat data dashboard", error: error.message });
    }
};