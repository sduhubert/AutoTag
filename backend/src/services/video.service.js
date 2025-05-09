import {Association, Op} from 'sequelize';
import Video from '../models/videoModel.js';
import Tag from '../models/tagModel.js';
import db from '../models/index.js';


class VideoService {
    static async getVideos() {
        try {
            const videos = await db.Video.findAll({
                include: [
                    {
                    model: db.Tag,
                    as: 'tags',
                    attributes: ['name']
                    },
                    {
                        model: db.VideoSummary,
                        as: 'video_summary',
                        attributes: ['summary']
                    },
                
                
                ]
            });
            return videos;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

export default VideoService;