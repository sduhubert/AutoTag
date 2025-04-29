// tag.controller.js
import db from '../models/index.js';
const { Tag } = db;

//get all tags
export const getTags = async (req, res) => { // GET /api/tags
  try {
    const tags = await Tag.findAll();
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

//create a new tag
export const createTag = async (req, res) => { // POST /api/tags
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ tag });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

//delete tag
export const deleteTag = async (req, res) => { // DELETE /api/tags/:id
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });

    await tag.destroy();
    res.status(200).json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};