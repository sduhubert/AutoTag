import db from '../models/index.js';
const { Language } = db;

//get all languages
export const getLanguages = async (req, res) => { // GET /api/languages
  try {
    const languages = await Language.findAll();
    res.status(200).json(languages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

//create a new language
export const createLanguage = async (req, res) => { // POST /api/languages
  try {
    const language = await Language.create(req.body);
    res.status(201).json({ language });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create a language' });
  }
};

//delete a language
export const deleteLanguage = async (req, res) => { // DELETE /api/languages/:id
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) return res.status(404).json({ error: 'Language is not found' });

    await language.destroy();
    res.status(200).json({ message: 'Language is deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete language' });
  }
};