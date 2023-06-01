const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.post("/skin_diseases", controller.predict.predictSkinDiseases);
router.post("/skin_types", controller.predict.predictSkinTypes);

module.exports = router;
