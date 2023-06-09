const jwt = require("jsonwebtoken");
const { User } = require("../models");

const { JWT_SECRET_KEY } = process.env;

module.exports = {
  mustLogin: async (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "you're not authorized!",
        });
      }

      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: "you're not authorized!",
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const existUser = await User.findOne({ where: { email: decoded.email } });

      if (!existUser) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: "you're not user !",
        });
      }

      req.user = decoded;
      next();
    } catch (err) {
      if (err.message == "jwt malformed") {
        return res.status(401).json({
          code: 401,
          success: false,
          message: err.message,
        });
      }
      next(err);
    }
  },
};
