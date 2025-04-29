// videoMetaModel.js
export default (sequelize, DataTypes) => {
  class VideoTag extends sequelize.Sequelize.Model {}
  VideoTag.init({
    videoid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tagid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'VideoTag',
    tableName: 'video_tag',
    timestamps: false,
  });

  class VideoLanguage extends sequelize.Sequelize.Model {}
  VideoLanguage.init({
    videoid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    languageid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    sequelize,
    modelName: 'VideoLanguage',
    tableName: 'video_language',
    timestamps: false,
  });

  return { VideoTag, VideoLanguage };
};