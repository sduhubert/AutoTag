import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import videoRoutes from './routes/video.routes.js'; //used to be uploadRoutes
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';
import summaryRoutes from './routes/summary.routes.js';
import languageRoutes from './routes/language.routes.js';
import videoMetaRoutes from './routes/videoMeta.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// Video uploading routes
app.use('/api/video', videoRoutes); //used to be /api/upload
// Add all routes
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/video-meta', videoMetaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
