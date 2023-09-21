const express = require("express");
const router = express.Router();
const WeblinkController = require("../controllers/WeblinkController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/weblinks/
router.get("/", authentication, permission, caching, WeblinkController.getall);
router.get(
  "/bycategoryid",
  authentication,
  permission,
  caching,
  WeblinkController.getbycategory
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  WeblinkController.getbyid
);
router.post("/", authentication, permission, resetcache, WeblinkController.add);
router.put("/", authentication, permission, resetcache, WeblinkController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  WeblinkController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  WeblinkController.updatestatus
);

module.exports = router;
