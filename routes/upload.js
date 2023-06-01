const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.post("/", mid.mustLogin, controller.upload.storage);

module.exports = router;
