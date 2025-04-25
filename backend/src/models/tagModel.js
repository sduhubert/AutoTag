export default (sequelize, DataTypes) => {
  class Tag extends sequelize.Sequelize.Model {}

  Tag.init({
    tagid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'tag',
    timestamps: false,
  });

  return Tag;
};