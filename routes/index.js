const express = require("express");
const router = express.Router();
require("dotenv-vault-core").config();
const { WELCOME_MESSAGE } = process.env;

const auth = require("./auth.js");
const upload = require("./upload.js");
const userSkin = require("./userSkin.js");
const product = require("./product.js");

router.get("/", (req, res) => {
  return res.status(200).json({
    code: 200,
    success: true,
    message: `${WELCOME_MESSAGE}`,
  });
});

router.use("/auth", auth);
router.use("/upload", upload);
router.use("/userSkin", userSkin);
router.use("/product", product);

module.exports = router;
