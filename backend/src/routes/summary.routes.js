import express from 'express';
import { getSummaries, getSummaryByVideoId, createSummary } from '../controllers/summary.controller.js';

const router = express.Router();
router.get('/', getSummaries); // GET /api/summaries
router.get('/:videoid', getSummaryByVideoId); // GET
router.post('/', createSummary); //GET

export default router;