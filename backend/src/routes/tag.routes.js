import express from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tag.controller.js';

const router = express.Router();
router.get('/', getTags); // GET /api/tags
router.post('/', createTag); //POST /api/tags
router.delete('/:id', deleteTag); //DELETE /api/tags/:id

export default router;