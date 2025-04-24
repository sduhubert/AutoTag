import multer from 'multer';
import path from 'path';

// Configure storage destination and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage });

// Middleware to handle single file upload
export const uploadSingle = upload.single('file');
