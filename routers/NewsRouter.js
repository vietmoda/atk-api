const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/videos/
router.get("/", authentication, permission, caching, NewsController.getall);
router.get(
  "/getwithtotal",
  authentication,
  caching,
  NewsController.getwithtotal
);
router.get(
  "/bycategoryid",
  authentication,
  caching,
  NewsController.getbycategory
);
router.get(
  "/countbycategoryid",
  authentication,
  permission,
  caching,
  NewsController.countbycategory
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  NewsController.getbyid
);
router.post("/", authentication, permission, resetcache, NewsController.add);
router.put("/", authentication, permission, resetcache, NewsController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  NewsController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  NewsController.updatestatus
);

module.exports = router;
