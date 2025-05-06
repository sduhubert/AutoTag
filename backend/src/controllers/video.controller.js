import db from '../models/index.js';
const { Video, Tag, VideoTag, VideoSummary } = db;
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

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

    // Copy file to shared folder
    const sharedUploadPath = '/app/uploads_shared';
    const sharedFilePath = path.join(sharedUploadPath, originalname);
    await fs.promises.copyFile(filePath, sharedFilePath);

    // After successful copy, delete the original file
    await fs.promises.unlink(filePath);

    // Returns duration of the video in hh:mm:ss format
    const getDuration = (filePath) => {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) return reject(err);
          const seconds = metadata.format.duration;
          const duration = new Date(seconds * 1000).toISOString().substr(11, 8); // hh:mm:ss
          resolve(duration);
        });
      });
    };

    // Get tags, transcript, and summaries from Python backend
    try {
      // Call the duration function
      const duration = await getDuration(sharedFilePath);

      // Create a FormData object to send the file to the Python backend
      const form = new FormData();
      form.append('file', fs.createReadStream(sharedFilePath));

      // Send the file to the Python backend for processing
      const response = await axios.post('http://ai:8001/upload-video', form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      const { tags, transcript, shortSummary } = response.data;

      // Store video metadata in the database
      try {
        const result = await db.sequelize.transaction(async (t) => {
          const newVideo = await Video.create({
            userid: req.user?.userid || 1, // Use authenticated user if available
            title: originalname,
            filepath: sharedFilePath,
            duration: duration,
            uploaded_at: new Date() // Add upload timestamp
          }, { transaction: t });

          // Process tags through junction table
          for (const tagName of tags) {
            const [tag] = await Tag.findOrCreate({
              where: { name: tagName },
              transaction: t
            });
            
            await VideoTag.create({
              videoid: newVideo.videoid,
              tagid: tag.tagid
            }, { transaction: t });
          }

          // Create video summary
          await VideoSummary.create({
            videoid: newVideo.videoid,
            summary: shortSummary // Matches schema column name
          }, { transaction: t });

          return { newVideo };
        });

        console.log('Video metadata saved to DB:', result.newVideo.toJSON());

        res.status(200).json({
          message: 'File uploaded and metadata stored.',
          video: result.newVideo,
          transcript,
          tags,
          shortSummary
        });

      } catch (dbErr) {
        console.error('Database error:', dbErr);
        await fs.promises.unlink(sharedFilePath).catch(console.error);
        res.status(500).json({ message: 'Failed to save video metadata.' });
      }
    } catch (pythonErr) {
      console.error('Error calling Python backend:', pythonErr);
      await fs.promises.unlink(sharedFilePath).catch(console.error);
      res.status(500).json({ message: 'Error processing video with Python backend.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed.' });
  }
}

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