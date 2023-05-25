require("dotenv-vault-core").config();
const { JWT_SECRET_KEY, BASE_URL } = process.env;
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userType = require("../utils/userType");
const utilEmail = require("../utils/email");

module.exports = {
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const existEmail = await User.findOne({ where: { email: email } });
      if (existEmail) {
        return res.status(409).json({
          code: 409,
          success: false,
          message: "email already used!",
        });
      }

      const encryptedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: encryptedPassword,
        username: "",
        name,
        phone: "",
        userType: userType.basic,
        isActive: false,
      });
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
          isActive: user.isActive,
        },
        JWT_SECRET_KEY
      );
      let htmlEmail = await utilEmail.getHtml("activation-mail.ejs", {
        name: user.name,
        link: `${BASE_URL}/auth/verify?token=${token}`,
      });
      const sendMail = await utilEmail.sendEmail(
        user.email,
        "Email Verification",
        htmlEmail
      );
      if (user && sendMail) {
        return res.status(200).json({
          code: 200,
          success: true,
          message: "success create user",
          data: {
            name: user.name,
            email: user.email,
          },
        });
      }
    } catch (err) {
      await User.destroy({ where: { email: req.body.email } });
      next(err);
    }
  },

  verify: async (req, res, next) => {
    try {
      const { token } = req.query;
      console.log(token);
      const decoded = jwt.verify(token, JWT_SECRET_KEY);

      const user = await User.findOne({ where: { id: decoded.id } });

      if (user) {
        await User.update(
          { isActive: true },
          {
            where: {
              id: decoded.id,
            },
          }
        );

        return res.status(200).json({
          code: 200,
          success: true,
          message: "success verify email",
        });
      }
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      const user = await User.findOne({ where: { email: email } });

      if (!emailRegex.test(email)) {
        //handle username login
        const user = await User.findOne({ where: { username: email } });
      }

      if (!user) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "invalid email or username!",
        });
      }

      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "invalid password!",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "please verify your email!",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
        },
        JWT_SECRET_KEY
      );

      return res.status(200).json({
        code: 200,
        success: true,
        message: "success login",
        data: {
          token: token,
          userId: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "invalid email!",
        });
      }

      //send otp to email
      const otp = Math.floor(100000 + Math.random() * 900000);

      const htmlEmail = await utilEmail.getHtml("otp-mail.ejs", {
        name: user.name,
        otp: otp,
      });

      const sendMail = await utilEmail.sendEmail(
        user.email,
        "Reset Password OTP",
        htmlEmail
      );

      if (!sendMail) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "failed send email!",
        });
      }

      const insertOtpToUser = await User.update(
        { otp: otp },
        { where: { email: user.email } }
      );

      if (!insertOtpToUser) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "failed update otp to database!",
        });
      }

      const tokenOtp = jwt.sign(
        {
          email: user.email,
        },
        JWT_SECRET_KEY
      );

      return res.status(200).json({
        code: 200,
        success: true,
        message: "success send otp to email",
        data: {
          token: tokenOtp,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  forgotVerify: async (req, res, next) => {
    try {
      const { token, otp } = req.body;
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const user = await User.findOne({ where: { email: decoded.email } });

      if (!user || user.otp !== otp) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "invalid OTP or email!",
        });
      }

      const tokenReset = jwt.sign(
        {
          email: user.email,
          otp: otp,
          action: "resetPwd",
        },
        JWT_SECRET_KEY
      );

      return res.status(200).json({
        code: 200,
        success: true,
        message: "otp valid, please reset your password!",
        data: {
          token: tokenReset,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      if (decoded.action !== "resetPwd") {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "you're not allowed!",
        });
      }

      const user = await User.findOne({
        where: { email: decoded.email, otp: decoded.otp },
      });

      if (!user) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "invalid token!",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "password not match!",
        });
      }

      const encryptedPassword = await bcrypt.hash(newPassword, 10);

      const updatePassword = await User.update(
        {
          password: encryptedPassword,
          otp: null,
        },
        {
          where: {
            email: decoded.email,
          },
        }
      );

      if (!updatePassword) {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "failed update password!",
        });
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message:
          "success update password, please log in using your new password!",
      });
    } catch (err) {
      next(err);
    }
  },
};
