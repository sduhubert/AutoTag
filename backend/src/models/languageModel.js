export default (sequelize, DataTypes) => {
  class Language extends sequelize.Sequelize.Model {}

  Language.init({
    languageid: {
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
    modelName: 'Language',
    tableName: 'language',
    timestamps: false,
  });

  return Language;
};