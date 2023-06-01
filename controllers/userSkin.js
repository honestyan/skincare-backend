require("dotenv").config();
const { JWT_SECRET_KEY, BASE_URL } = process.env;
const { User, UserSkin } = require("../models");
const jwt = require("jsonwebtoken");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const { id } = decoded;

      const user = await User.findOne({
        where: { id: id },
      });

      if (!user) {
        return res.status(404).json({
          code: 404,
          success: false,
          message: "User not found!",
        });
      }

      //getAll userSkin by userId
      const userSkin = await UserSkin.findAll({
        where: { userId: id },
      });

      if (!userSkin) {
        return res.status(404).json({
          code: 404,
          success: false,
          message: "User skin not found!",
        });
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
      };

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Success get user skin data!",
        data: {
          user: userData,
          userSkin: userSkin,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  add: async (req, res, next) => {
    try {
      const { skinType, skinDisease, imageUrl } = req.body;

      if (!skinType || !skinDisease || !imageUrl) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Please fill all required fields!",
        });
      }

      //valid imageUrl format
      const validUrl = imageUrl.match(
        /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|JPG|GIF|PNG|JPEH|Jpg|Png|Jpeg|Gif)/g
      );

      if (!validUrl) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Image extension not allowed!",
        });
      }

      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const { id } = decoded;

      const user = await User.findOne({ where: { id: id } });

      if (!user) {
        return res.status(404).json({
          code: 404,
          success: false,
          message: "User not found!",
        });
      }

      const newUserSkin = await user.createUserSkin({
        skinType: skinType,
        skinDisease: skinDisease,
        imageUrl: imageUrl,
      });

      if (!newUserSkin) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal server error!",
        });
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Success add user skin data!",
        data: {
          userSkin: {
            id: newUserSkin.id,
            userId: newUserSkin.userId,
            skinType: newUserSkin.skinType,
            skinDisease: newUserSkin.skinDisease,
            imageUrl: newUserSkin.imageUrl,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
