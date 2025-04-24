import db from '../models/index.js';
const { VideoSummary } = db;

//get all summaries
export const getSummaries = async (req, res) => { // GET /api/summaries
  try {
    const summaries = await VideoSummary.findAll();
    res.status(200).json(summaries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
};

//create video summary
export const createSummary = async (req, res) => { // POST /api/summaries
  try {
    const summary = await VideoSummary.create(req.body);
    res.status(201).json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create summary' });
  }
};

//get video summary by video_id
export const getSummaryByVideoId = async (req, res) => { // GET
  try {
    const summary = await VideoSummary.findOne({ where: { videoid: req.params.videoid } });
    if (!summary) return res.status(404).json({ error: 'Summary not found' });
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};