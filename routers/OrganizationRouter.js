const express = require("express");
const router = express.Router();
const OrganizationController = require("../controllers/OrganizationController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/role
//get method
router.get(
  "/",
  authentication,
  permission,
  caching,
  OrganizationController.getall
);
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  OrganizationController.getbyid
);
router.get(
  "/bycode",
  authentication,
  permission,
  caching,
  OrganizationController.getbycode
);
//post method
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  OrganizationController.add
);
//put method
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  OrganizationController.edit
);
router.put(
  "/destroy",
  authentication,
  permission,
  resetcache,
  OrganizationController.destroy
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  OrganizationController.updatestatus
);
//delete method
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  OrganizationController.remove
);

module.exports = router;
