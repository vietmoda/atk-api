const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const permission = require("../middleware/permission");

//api/categories
router.get("/", authentication, permission, caching, CategoryController.getall);

//api/categories/byid
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  CategoryController.getbyid
);

//api/categories/bycode
/*
router.get(
  "/bycode",
  authentication,
  permission,
  caching,
  CategoryController.getbycode
);
*/
//api/categories
router.post("/", authentication, permission, CategoryController.add);

//api/categories/destroy
router.put(
  "/updatestatus",
  authentication,
  permission,
  CategoryController.updatestatus
);

//api/categories
router.put("/", authentication, permission, CategoryController.edit);

//api/categories/
router.delete("/", authentication, permission, CategoryController.remove);

module.exports = router;
