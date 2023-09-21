const express = require("express");
const router = express.Router();
const NewsCategoryController = require("../controllers/NewsCategoryController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/newscategories
router.get(
  "/",
  authentication,
  permission,
  caching,
  NewsCategoryController.getall
);
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  NewsCategoryController.getbyid
);
router.get(
  "/tree",
  authentication,
  permission,
  caching,
  NewsCategoryController.gettrees
);
//post method
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  NewsCategoryController.add
);
//put method
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  NewsCategoryController.edit
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  NewsCategoryController.updatestatus
);
//delete method
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  NewsCategoryController.remove
);

module.exports = router;
