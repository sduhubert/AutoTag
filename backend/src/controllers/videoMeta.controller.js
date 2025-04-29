//for tag/video_tag, video_language
import db from '../models/index.js';
const { VideoTag, VideoLanguage } = db;

//get all videoMeta (tags and languages)
export const getVideoMeta = async (req, res) => { // GET - /api/video-meta
  try {
    const tags = await VideoTag.findAll();
    const languages = await VideoLanguage.findAll();
    res.status(200).json({ tags, languages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
};

//get video meta by ID (for both tags and languages)
export const getVideoMetaById = async (req, res) => { //GET - /api/video-meta/:id
  try {
    // Assuming you're looking for both VideoTag and VideoLanguage by ID
    const tag = await VideoTag.findByPk(req.params.id);
    const language = await VideoLanguage.findByPk(req.params.id);

    if (!tag && !language) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    res.status(200).json({ tag, language });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video metadata by ID' });
  }
};

//delete video meta (tag or language) by ID
export const deleteVideoMeta = async (req, res) => { //DELETE - /api/video-meta/:id
  try {
    const tag = await VideoTag.findByPk(req.params.id);
    const language = await VideoLanguage.findByPk(req.params.id);

    if (!tag && !language) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    if (tag) {
      await tag.destroy();
      res.status(200).json({ message: 'Tag deleted successfully' });
    }

    if (language) {
      await language.destroy();
      res.status(200).json({ message: 'Language deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video metadata' });
  }
};