const express = require("express");
const router = express.Router();

const { WELCOME_MESSAGE } = process.env;

const auth = require("./auth.js");
const upload = require("./upload.js");
const userSkin = require("./userSkin.js");
const product = require("./product.js");
const profile = require("./profile.js");
const models = require("./models.js");
const predict = require("./predict.js");

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
router.use("/profile", profile);
router.use("/models", models);
router.use("/predict", predict);

module.exports = router;
