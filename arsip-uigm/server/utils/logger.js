const db = require('../config/database');

const logActivity = async (req, actionDetails) => {
    try {
        const userId = req.user ? req.user.id : 0;
        const username = req.user ? req.user.username || req.user.nama : 'System';
        const role = req.user ? req.user.role : 'Guest';
        
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');

        await db.query(
            `INSERT INTO user_logs (user_id, username, role, action, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, username, role, actionDetails, ip, userAgent]
        );
    } catch (error) {
        console.error("Gagal mencatat log:", error.message);
    }
};

module.exports = logActivity;