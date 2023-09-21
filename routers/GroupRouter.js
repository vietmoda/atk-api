const express = require("express");
const router = express.Router();
const GroupController = require("../controllers/GroupController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/group
router.get("/", authentication, permission, caching, GroupController.getall);
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  GroupController.getbyid
);
router.post("/", authentication, permission, resetcache, GroupController.add);
router.put("/", authentication, permission, resetcache, GroupController.edit);
router.put(
  "/editrole",
  authentication,
  permission,
  resetcache,
  GroupController.editrole
);
router.put(
  "/ingroup",
  authentication,
  permission,
  resetcache,
  GroupController.ingroup
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  GroupController.updatestatus
);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  GroupController.remove
);

module.exports = router;
