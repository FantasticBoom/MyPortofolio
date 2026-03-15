const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const logActivity =require('../utils/logger');

const md5 = (string) => crypto.createHash('md5').update(string).digest('hex');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE LOWER(user) = LOWER(?) LIMIT 1', [username]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Username tidak ditemukan." });
        }

        const user = users[0];
        let passwordValid = false;
        let migrationNeeded = false;
        if (user.password && (user.password.startsWith('$2y$') || user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            passwordValid = await bcrypt.compare(password, user.password);
        } 
        else {
            if (password === user.password) {
                passwordValid = true;
                migrationNeeded = true; 
            } else if (md5(password) === user.password) {
                passwordValid = true;
                migrationNeeded = true;
            }
        }

        if (!passwordValid) {
            return res.status(401).json({ message: "Password salah!" });
        }

        if (migrationNeeded) {
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
            console.log(`[Security] Password user ${username} berhasil dimigrasi ke Bcrypt.`);
        }

        // Buat JWT Token
        const token = jwt.sign(
            { 
                id: user.id,        
                role: user.role,    
                nama: user.nama_lengkap 
            }, 
            process.env.JWT_SECRET || 'rahasia_negara_123',
            { expiresIn: '1d' }
        );

        req.user = { id: user.id, username: user.user, role: user.role};
        await logActivity(req, 'Login Berhasil');

        // Kirim Respon Login Sukses
        res.json({
            status: "success",
            message: "Login berhasil",
            token: token,
            user: {
                id: user.id,
                username: user.user,
                nama: user.nama_lengkap,
                role: user.role,
                foto: user.foto_profil || 'Gambar/profil/default-profil.png'
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

exports.getMe = async (req, res) => {
    // API untuk mengambil data user yang sedang login 
    try {
        const [users] = await db.query('SELECT id, user, nama_lengkap, role, foto_profil FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = users[0];
        res.json({
            id: user.id,
            username: user.user,
            nama: user.nama_lengkap,
            role: user.role,
            foto: user.foto_profil || 'Gambar/profil/default-profil.png'
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};