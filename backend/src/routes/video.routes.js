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

router.post('/upload', uploadSingle, uploadFile); //post /api/video/upload
router.get('/', getVideos); //get /api/video/
router.get('/:id', getVideoById); // get /api/video/:id
router.delete('/:id', deleteVideo); // delete /api/video/:id
router.put('/:id', updateVideo); // put /api/video/:id
router.put('/:id/tags', updateVideoTags); // PUT /api/video/:id/tags
router.put('/:id/summary', updateVideoSummary); // PUT  /api/video/:id/summary
router.put('/:id/validation', updateVideoValidation); //DELETE /api/:id/validation

export default router;