import db from '../models/index.js';
const { Video } = db;

//get all videos
export const getVideos = async (req, res) => { // GET - api/video
    try {
        const videos = await Video.findAll();
        res.status(200).json({ videos });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

//(create a new video) - upload video file
export const uploadFile = (req, res) => { // POST - api/video/upload
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ message: "File uploaded successfully", file: req.file });
};

// Get video by ID
export const getVideoById = async (req, res) => { //GET /api/video/:id
    try {
      const video = await Video.findByPk(req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
      res.status(200).json({ video });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  };

// Delete video
export const deleteVideo = async (req, res) => { // DELETE /api/video/:id
    try {
      const video = await Video.findByPk(req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
  
      await video.destroy();
      res.status(200).json({ message: 'Video deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete video' });
    }
  };