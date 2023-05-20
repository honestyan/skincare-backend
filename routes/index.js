const express = require("express");
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
// const auth = require("./auth");

router.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Welcome to Skincare API",
  });
});

// router.use("/auth", auth);

module.exports = router;
