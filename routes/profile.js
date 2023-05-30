const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.get("/", mid.mustLogin, controller.profile.getProfile);
router.put("/", mid.mustLogin, controller.profile.updateProfile);

module.exports = router;
