require("dotenv-vault-core").config();
const { JWT_SECRET_KEY, BASE_URL } = process.env;
const { User } = require("../models");
const jwt = require("jsonwebtoken");

module.exports = {
  getProfile: async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      const decoded = jwt.verify(token, JWT_SECRET_KEY);

      const user = await User.findOne({
        where: {
          email: decoded.email,
        },
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
      });

      if (!user) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "User found",
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const { username, name, phone } = req.body;
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET_KEY);

      if (!username || !name || !phone) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Please fill all required fields",
        });
      }

      //regex username
      const regexUsername = /^[a-zA-Z0-9]+$/;
      if (!regexUsername.test(username)) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Username must be alphanumeric",
        });
      }

      //regex phone
      const regexPhone = /^[0-9]+$/;
      if (!regexPhone.test(phone)) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Phone must be numeric",
        });
      }

      const user = await User.findOne({
        where: {
          email: decoded.email,
        },
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
      });

      if (!user) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "User not found",
        });
      }

      const updateUser = await User.update(
        {
          username: username.toLowerCase(),
          name,
          phone,
        },
        {
          where: {
            email: decoded.email,
          },
        }
      );

      const userUpdated = await User.findOne({
        where: {
          email: decoded.email,
        },
        attributes: {
          exclude: ["password", "createdAt", "updatedAt"],
        },
      });

      return res.status(200).json({
        code: 200,
        success: true,
        message: "User has been updated",
        data: {
          user: userUpdated,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
