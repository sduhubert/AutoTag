export default (sequelize, DataTypes) => {
  class VideoSummary extends sequelize.Sequelize.Model {}

  VideoSummary.init({
    videoid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: true,  // Adjust according to your requirements
    },
  }, {
    sequelize,
    modelName: 'VideoSummary',
    tableName: 'video_summary', // or whatever the actual table name is
    timestamps: false,  // Add if necessary
  });

  return VideoSummary;
};