const express = require("express");
const router = express.Router();
require("dotenv-vault-core").config();
const { WELCOME_MESSAGE } = process.env;

// Require the controllers WHICH WE DID NOT CREATE YET!!
// const auth = require("./auth");

router.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: `${WELCOME_MESSAGE}`,
  });
});

// router.use("/auth", auth);

module.exports = router;
