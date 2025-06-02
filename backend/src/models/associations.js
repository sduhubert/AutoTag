export default function setupAssociations(db) {
  const { User, Video, Tag, Language, VideoTag, VideoSummary, VideoLanguage } = db;

  // User - Video
  User.hasMany(Video, { foreignKey: 'userid' });
  Video.belongsTo(User, { foreignKey: 'userid' });

  // Video - Tag many-to-many
  Video.belongsToMany(Tag, {
    through: VideoTag,
    foreignKey: 'videoid',
    otherKey: 'tagid',
    as: 'tags',
  });
  Tag.belongsToMany(Video, {
    through: VideoTag,
    foreignKey: 'tagid',
    otherKey: 'videoid',
    as: 'videos',
  });

  VideoTag.belongsTo(Video, { foreignKey: 'videoid' });
  VideoTag.belongsTo(Tag, { foreignKey: 'tagid' });

  // Video - VideoSummary 1:1
  Video.hasOne(VideoSummary, { foreignKey: 'videoid', as: 'video_summary' });
  VideoSummary.belongsTo(Video, { foreignKey: 'videoid', as: 'video' });

  // Video - Language many-to-many
  Video.belongsToMany(Language, {
    through: VideoLanguage,
    foreignKey: 'videoid',
    otherKey: 'languageid',
    as: 'languages',
  });
  Language.belongsToMany(Video, {
    through: VideoLanguage,
    foreignKey: 'languageid',
    otherKey: 'videoid',
    as: 'videos',
  });

  VideoLanguage.belongsTo(Video, { foreignKey: 'videoid' });
  VideoLanguage.belongsTo(Language, { foreignKey: 'languageid' });
}
