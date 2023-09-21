const express = require("express");
const router = express.Router();
const AlbumController = require("../controllers/AlbumController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");
//api/albums/
router.get("/", authentication, permission, caching, AlbumController.getall);
router.get(
  "/bycategoryid",
  authentication,
  permission,
  caching,
  AlbumController.getbycategory
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  AlbumController.getbyid
);
router.post("/", authentication, permission, resetcache, AlbumController.add);
router.post(
  "/multi",
  authentication,
  permission,
  resetcache,
  AlbumController.addmulti
);
router.put("/", authentication, permission, resetcache, AlbumController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  AlbumController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  AlbumController.updatestatus
);

module.exports = router;
