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
        link: `${BASE_URL}/verify?token=${token}`,
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
          message: "success: create user",
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
};
