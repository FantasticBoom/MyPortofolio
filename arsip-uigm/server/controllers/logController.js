const db = require('../config/database');

exports.getLogs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user_logs ORDER BY created_at DESC LIMIT 500');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil log", error: error.message });
    }
};