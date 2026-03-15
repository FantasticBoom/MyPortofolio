const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fungsi untuk membuat storage engine yang dinamis
const createStorage = (folderName) => {
    const uploadDir = `public/uploads/${folderName}`;
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            cb(null, uniqueSuffix + '_' + cleanName);
        }
    });
};

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
    }
};

// Export fungsi yang menerima parameter folderName
module.exports = (folderName) => multer({
    storage: createStorage(folderName),
    limits: { fileSize: 20 * 1024 * 1024 }, 
    fileFilter: fileFilter
});