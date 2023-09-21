const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RoleController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/role
//get method
router.get("/", authentication, permission, caching, RoleController.getall);
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  RoleController.getbyid
);
//post method
router.post("/", authentication, permission, resetcache, RoleController.add);
//put method
router.put("/", authentication, permission, resetcache, RoleController.edit);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  RoleController.updatestatus
);
//delete method
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  RoleController.remove
);

module.exports = router;
