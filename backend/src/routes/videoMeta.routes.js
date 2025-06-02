//for tag/video_tag, video_language
import express from 'express';
import { getVideoMeta, getVideoMetaById, deleteVideoMeta } from '../controllers/videoMeta.controller.js';

const router = express.Router();
router.get('/', getVideoMeta); // GET /api/video-meta
router.get('/:id', getVideoMetaById); //GET - /api/video-meta/:id (get by ID)
router.delete('/:id', deleteVideoMeta); //DELETE - /api/video-meta/:id (delete by ID)

export default router;