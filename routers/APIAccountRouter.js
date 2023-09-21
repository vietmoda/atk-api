const express = require("express");
const router = express.Router();
const APIAccountController = require("../controllers/APIAccountController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//get method
router.get(
  "/",
  authentication,
  permission,
  caching,
  APIAccountController.getall
);
//post method
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  APIAccountController.add
);
//put method
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  APIAccountController.edit
);
//delete method
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  APIAccountController.remove
);

module.exports = router;
