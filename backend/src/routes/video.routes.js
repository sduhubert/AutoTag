import express from 'express';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { uploadFile, getVideos, deleteVideo, getVideoById } from '../controllers/video.controller.js';

const router = express.Router();

router.post('/upload', uploadSingle, uploadFile); // GET /api/video/upload
router.get('/', getVideos); //GET /api/video
router.get('/:id', getVideoById); //GET /api/video/:id
router.delete('/:id', deleteVideo); //DELETE /api/video/:id

export default router;
