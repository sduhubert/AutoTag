import db from '../models/index.js';
const { Video, Tag, VideoTag, VideoSummary, Language, VideoLanguage } = db;
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { publicDecrypt } from 'crypto';
import VideoService from '../services/video.service.js';
import { Op } from 'sequelize';

// Get all videos

export const getVideos = async(req, res) => {
  try {
    const videos = await VideoService.getVideos();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
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

// export const getVideoById = async(req, res) => {
//   try {
//     const videoId = parseInt(req.params.id,10);
//     console.log(videoId);
//     if(!videoId) return res.status(404).json({ error: 'Video id not found' });
//     const video = await VideoService.getVideoById(videoId);
//     res.json(video);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch video' });
//   }
// }

//(create a new video) - upload video file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Extract metadata
    const { originalname, path: filePath } = req.file;
    const newFilename = Buffer.from(originalname, 'latin1').toString('utf8'); //fix encoding
    const extension = path.extname(newFilename);

     
    // Copy file to shared folder
    const sharedUploadPath = '/app/uploads_shared';
    const sharedFilePath = path.join(sharedUploadPath, newFilename);
    await fs.promises.copyFile(filePath, sharedFilePath);

    //Copy thumbnail into shared folder thumbnails.
    const thumbnailFilename = path.basename(originalname, extension) + '.png';
    const thumbnailFolder = '/app/uploads_shared/thumbnails';
    const thumbnailPath = path.join(thumbnailFolder, thumbnailFilename);
    await fs.promises.mkdir(thumbnailFolder, { recursive: true });

    //Take a screenshot from the video
    await new Promise((resolve, reject) => {
      ffmpeg(sharedFilePath)
      .screenshots({
        count: 1, 
       timemarks: ['00:00:01.000'], 
        filename: thumbnailFilename, 
        folder: thumbnailFolder, 
        size: '320x240' 
      })
    .on('end', resolve) 
    .on('error', reject);
    });

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
      const { tags, transcript, shortSummary, language } = response.data;

      // Store video metadata in the database
      try {
        const result = await db.sequelize.transaction(async (t) => {
          const newVideo = await Video.create({
            userid: req.user?.userid || 1, // Use authenticated user if available
            title: newFilename,
            filepath: sharedFilePath,
            duration: duration,
            uploaded_at: new Date(), // Add upload timestamp
            thumbnail: thumbnailPath
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

          // ✅ Handle language storage
          if (language) {
            const [languageRecord] = await db.Language.findOrCreate({
              where: { name: language },
              transaction: t
            });

            await db.VideoLanguage.create({
              videoid: newVideo.videoid,
              languageid: languageRecord.languageid
            }, { transaction: t });
          }
          
          // Create video summary
          await VideoSummary.create({
            videoid: newVideo.videoid,
            summary: shortSummary, // Matches schema column name
          }, { transaction: t });

          return { newVideo };
        });

        console.log('Video metadata saved to DB:', result.newVideo.toJSON());

        res.status(200).json({
          message: 'File uploaded and metadata stored.',
          video: result.newVideo,
          thumbnailPath,
          transcript,
          tags,
          shortSummary,
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


// Delete video
export const deleteVideo = async (req, res) => { // DELETE /api/video/:id
    try {
      const video = await Video.findByPk(req.params.id);
      if (!video) return res.status(404).json({ error: 'Video not found' });
  
      await video.destroy();
      res.status(200).json({ message: 'Video deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete video' });
    }};
    
  // Update video title
export const updateVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    // Update only the title
    video.title = title;
    await video.save();
    
    res.status(200).json({ 
      message: 'Video title updated successfully',
      video: video
    });
  } catch (err) {
    console.error('Error updating video:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
};

// Update video tags
export const updateVideoTags = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array is required' });
    }
    
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    await db.sequelize.transaction(async (t) => {
      // Remove all existing tags for this video
      await VideoTag.destroy({
        where: { videoid: videoId },
        transaction: t
      });
      
      // Add new tags
      for (const tagName of tags) {
        if (tagName.trim()) {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            transaction: t
          });
          
          await VideoTag.create({
            videoid: videoId,
            tagid: tag.tagid
          }, { transaction: t });
        }
      }
    });
    
    res.status(200).json({ 
      message: 'Video tags updated successfully'
    });
  } catch (err) {
    console.error('Error updating video tags:', err);
    res.status(500).json({ error: 'Failed to update video tags' });
  }
};

// Update video summary
export const updateVideoSummary = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { summary } = req.body;
    
    if (summary === undefined || summary === null) {
      return res.status(400).json({ error: 'Summary is required' });
    }
    
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    // Find the video summary record
    let videoSummary = await VideoSummary.findOne({
      where: { videoid: videoId }
    });
    
    if (videoSummary) {
      // Update existing summary
      videoSummary.summary = summary;
      await videoSummary.save();
    } else {
      // Create new summary if it doesn't exist
      await VideoSummary.create({
        videoid: videoId,
        summary: summary
      });
    }
    
    res.status(200).json({ 
      message: 'Video summary updated successfully'
    });
  } catch (err) {
    console.error('Error updating video summary:', err);
    res.status(500).json({ error: 'Failed to update video summary' });
  }
};

// Update video validation status
export const updateVideoValidation = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { validated } = req.body;
    
    if (typeof validated !== 'boolean') {
      return res.status(400).json({ error: 'Validated must be a boolean value' });
    }
    
    const video = await Video.findByPk(videoId);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    
    // Update the validation status
    video.validated = validated;
    await video.save();
    
    res.status(200).json({ 
      message: 'Video validation status updated successfully',
      validated: video.validated
    });
  } catch (err) {
    console.error('Error updating video validation:', err);
    res.status(500).json({ error: 'Failed to update video validation' });
  }
};


// Search videos function - handles video search functionality
export const searchVideos = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = q.trim();
    const offset = (page - 1) * limit;

    const { rows: videos, count: totalCount } = await Video.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { '$tags.name$': { [Op.iLike]: `%${searchTerm}%` } },
          { '$video_summary.summary$': { [Op.iLike]: `%${searchTerm}%` } },
          { '$languages.name$': { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        {
          model: Tag,
          as: 'tags',                    // make sure this matches your model alias
          through: { attributes: [] },
          required: false,
        },
        {
          model: VideoSummary,
          as: 'video_summary',           // make sure this matches your model alias
          required: false,
        },
        {
          model: db.Language,
          as: 'languages',               // make sure this matches your model alias
          through: { attributes: [] },
          required: false,
        },
      ],
      distinct: true,      // ensures correct count with joins
      offset,
      limit: parseInt(limit),
      order: [['uploaded_at', 'DESC']],
      subQuery: false,     // IMPORTANT: disables subquery to fix missing FROM-clause error
    });

    res.json({
      videos,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      searchTerm,
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search videos' });
  }
};