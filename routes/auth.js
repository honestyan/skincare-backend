const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.post("/register", controller.auth.register);
router.get("/verify", controller.auth.verify);
router.post("/login", controller.auth.login);

module.exports = router;
