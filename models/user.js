"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //userSkin
      User.hasMany(models.UserSkin, {
        as: "userSkin",
        foreignKey: {
          name: "userId",
        },
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      username: DataTypes.STRING,
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      userType: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      otp: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
