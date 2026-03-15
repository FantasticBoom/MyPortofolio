const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Ambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    // 2. Verifikasi Token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_negara_123');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token tidak valid atau kadaluwarsa." });
    }
};

module.exports = verifyToken;