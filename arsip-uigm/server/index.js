const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const masterRoutes = require('./routes/masterRoutes');
const arsipRoutes = require('./routes/arsipRoutes');
const suratRoutes = require('./routes/suratRoutes');
const skRoutes = require('./routes/skRoutes');
const logRoutes = require('./routes/logRoutes');
const generatorRoutes = require('./routes/generatorRoutes');

// Middleware Global
app.use(cors());
app.use(express.json());

// --- FIX 1: Middleware untuk menangani Double Slash (//) ---
// Ini akan mengubah request '//uploads/...' menjadi '/uploads/...' secara otomatis
app.use((req, res, next) => {
    if (req.url.startsWith('//')) {
        req.url = req.url.replace('//', '/');
    }
    next();
});

// --- FIX 2: Konfigurasi Folder Static yang Lebih Aman ---
// Pastikan path absolut ke folder public/uploads
const uploadPath = path.join(__dirname, 'public/uploads');

// Cek apakah folder ada, untuk debugging
if (!fs.existsSync(uploadPath)) {
    console.warn(`⚠️ Peringatan: Folder upload tidak ditemukan di: ${uploadPath}`);
    // Opsional: Buat folder jika belum ada agar tidak error
    fs.mkdirSync(uploadPath, { recursive: true });
} else {
    console.log(`📂 Folder Upload siap di: ${uploadPath}`);
}

// Serving Static Files
// URL: http://localhost:5000/uploads/surat/namafile.pdf
app.use('/uploads', express.static(uploadPath));


// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/arsip', arsipRoutes);
app.use('/api/surat', suratRoutes);
app.use('/api/sk', skRoutes);
app.use('/api/log', logRoutes);
app.use('/api/generator', generatorRoutes);

// 1. Cek Server Jalan
app.get('/', (req, res) => {
    res.send('Server Backend Arsip Berjalan (Mode: Native MySQL)');
});

// 2. Cek Koneksi Database
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bagian LIMIT 5');
        
        res.json({
            status: 'success',
            message: 'Data berhasil diambil dari db_arsip',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Query Gagal',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});