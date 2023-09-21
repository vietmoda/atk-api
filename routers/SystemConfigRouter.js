const express = require("express");
const router = express.Router();
const SystemConfigController = require("../controllers/SystemConfigController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/systemconfigs/
router.get(
  "/",
  authentication,
  permission,
  caching,
  SystemConfigController.getall
);
router.get(
  "/getbykey",
  authentication,
  permission,
  caching,
  SystemConfigController.getbykey
);
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  SystemConfigController.add
);
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  SystemConfigController.edit
);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  SystemConfigController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  SystemConfigController.updatestatus
);
module.exports = router;
