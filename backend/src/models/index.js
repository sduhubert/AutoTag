import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import configJson from '../config/config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configJson[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load regular models
const files = fs.readdirSync(__dirname).filter(file =>
  file.endsWith('.js') &&
  file !== path.basename(__filename) &&
  !file.endsWith('.test.js') &&
  file !== 'videoMetaModel.js' &&
  file !== 'associations.js'
);

// Import and register models
for (const file of files) {
  const module = await import(path.join(__dirname, file));
  const model = module.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Load meta models (after sequelize is ready)
import defineMetaModels from './videoMetaModel.js';
const { VideoTag, VideoLanguage } = defineMetaModels(sequelize, Sequelize.DataTypes);
db.VideoTag = VideoTag;
db.VideoLanguage = VideoLanguage;

// Now that all models are registered, define associations
import setupAssociations from './associations.js';
setupAssociations(db);

// Optional: call associate methods if defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;