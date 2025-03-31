import express from 'express';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { uploadFile } from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/upload', uploadSingle, uploadFile);

export default router;
