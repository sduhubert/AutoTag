export default function setupAssociations(db) {
  const { User, 
          Video, 
          Tag, 
          Language, 
          VideoTag, 
          VideoSummary, 
          VideoLanguage } = db;

//user-video association
  User.hasMany(Video, { foreignKey: 'userid' });
  Video.belongsTo(User, { foreignKey: 'userid' });

//video-tag
  Video.belongsToMany(Tag, {
    through: VideoTag,
    foreignKey: 'videoid',
    otherKey: 'tagid',
  });
  Tag.belongsToMany(Video, {
    through: VideoTag,
    foreignKey: 'tagid',
    otherKey: 'videoid',
  });

  VideoTag.belongsTo(Video, { foreignKey: 'videoid' });
  VideoTag.belongsTo(Tag, { foreignKey: 'tagid' });

  Video.hasOne(VideoSummary, { foreignKey: 'videoid' });
  VideoSummary.belongsTo(Video, { foreignKey: 'videoid' });

  Video.belongsToMany(Language, {
    through: VideoLanguage,
    foreignKey: 'videoid',
    otherKey: 'languageid',
  });
  Language.belongsToMany(Video, {
    through: VideoLanguage,
    foreignKey: 'languageid',
    otherKey: 'videoid',
  });

  VideoLanguage.belongsTo(Video, { foreignKey: 'videoid' });
  VideoLanguage.belongsTo(Language, { foreignKey: 'languageid' });
}