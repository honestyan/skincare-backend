const express = require("express");
const router = express.Router();
require("dotenv-vault-core").config();
const { WELCOME_MESSAGE } = process.env;

const auth = require("./auth.js");

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: `${WELCOME_MESSAGE}`,
  });
});

router.use("/auth", auth);

module.exports = router;
