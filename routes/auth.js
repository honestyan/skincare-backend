const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.post("/register", controller.auth.register);
router.get("/verify", controller.auth.verify);
router.post("/login", controller.auth.login);
router.post("/googleOauth", controller.auth.googleOauth);
router.post("/forgotPassword", controller.auth.forgotPassword);
router.post("/forgotVerify", controller.auth.forgotVerify);
router.post("/resetPassword", controller.auth.resetPassword);

module.exports = router;
