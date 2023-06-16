const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.get("/", mid.mustLogin, controller.userSkin.getAll);
router.post("/", mid.mustLogin, controller.userSkin.add);

module.exports = router;
