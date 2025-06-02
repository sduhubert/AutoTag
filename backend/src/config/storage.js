import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from './database';

const uploadDir = path.join(process.cwd(), 'uploads'); // Save to backend/uploads

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

export default upload;
