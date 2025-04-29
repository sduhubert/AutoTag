//treat users and admin as one, but distinguish
export default (sequelize, DataTypes) => {
  class User extends sequelize.Sequelize.Model {}

  User.init({
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
  });

  return User;
};