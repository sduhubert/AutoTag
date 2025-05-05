import db from '../models/index.js';
const { Video } = db;
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

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
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Extract metadata
    const { originalname, path: filePath } = req.file;
    const extension = path.extname(originalname);

    // Get duration using ffmpeg
    ffmpeg.ffprobe(filePath, async (err, metadata) => {
      if (err) {
        console.error('ffprobe error:', err);
        return res.status(500).json({ message: 'Error reading video metadata.' });
      }

      const seconds = metadata.format.duration;
      const duration = new Date(seconds * 1000).toISOString().substr(11, 8);

      // Store metadata in database
      try {
        const newVideo = await db.Video.create({
          userid: 1,
          title: originalname,
          filepath: filePath,
          duration: duration
        });
        
        console.log('Video metadata saved to DB:', newVideo.toJSON());
        
        res.status(200).json({ message: 'File uploaded and metadata stored.' });

      } catch (dbErr) {
        console.error('Database error:', dbErr);
        res.status(500).json({ message: 'Failed to save video metadata.' });
      }
  });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed.' });
  }
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