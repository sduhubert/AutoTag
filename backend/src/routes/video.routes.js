import express from 'express';
import { uploadSingle } from '../middleware/upload.middleware.js';
import { 
  uploadFile, 
  getVideos, 
  deleteVideo, 
  getVideoById, 
  updateVideo,
  updateVideoTags,
  updateVideoSummary,
  updateVideoValidation
} from '../controllers/video.controller.js';

const router = express.Router();

router.post('/upload', uploadSingle, uploadFile);
router.get('/', getVideos);
router.get('/:id', getVideoById);
router.delete('/:id', deleteVideo);
router.put('/:id', updateVideo);
router.put('/:id/tags', updateVideoTags);
router.put('/:id/summary', updateVideoSummary);
router.put('/:id/validation', updateVideoValidation);

export default router;