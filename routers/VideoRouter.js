const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/VideoController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/videos/
router.get("/", authentication, permission, caching, VideoController.getall);
router.get(
  "/bycategoryid",
  authentication,
  permission,
  caching,
  VideoController.getbycategory
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  VideoController.getbyid
);
router.post("/", authentication, permission, resetcache, VideoController.add);
router.put("/", authentication, permission, resetcache, VideoController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  VideoController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  VideoController.updatestatus
);

module.exports = router;
