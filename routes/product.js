const express = require("express");
const router = express.Router();
const controller = require("../controllers");
const mid = require("../helpers/middleware");

router.post("/", controller.product.addProduct);
router.get("/", controller.product.getProduct);
router.delete("/:id", controller.product.deleteProduct);
router.put("/:id", controller.product.updateProduct);

module.exports = router;
