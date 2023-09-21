const express = require("express");
const router = express.Router();
const AreaController = require("../controllers/AreaController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");
//api/areas/
router.get("/", authentication, permission, caching, AreaController.getall);
router.get("/trees", authentication, permission, caching, AreaController.gettrees);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  AreaController.getbyid
);
router.get(
  "/getbycode",
  authentication,
  permission,
  caching,
  AreaController.getbycode
);
router.post("/", authentication, permission, resetcache, AreaController.add);
router.put("/", authentication, permission, resetcache, AreaController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  AreaController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  AreaController.updatestatus
);

module.exports = router;
