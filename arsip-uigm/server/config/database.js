const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log('✅ Berhasil terhubung ke Database MySQL (db_arsip)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke Database:', err.message);
    });

module.exports = db;