import express from 'express';
import { getLanguages, createLanguage, deleteLanguage } from '../controllers/language.controller.js';

const router = express.Router();
router.get('/', getLanguages); // GET /api/languages
router.post('/', createLanguage); //POST /api/languages
router.delete('/:id', deleteLanguage); //DELETE /api/languages/:id

export default router;