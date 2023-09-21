const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/CategoryItemController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/items/
router.get("/", authentication, permission, caching, ItemController.getall);

//api/item/
router.get(
  "/bycategoryid",
  authentication,
  permission,
  caching,
  ItemController.getbycategoryid
);

//api/item/getbyid
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  ItemController.getbyid
);

//api/item
router.post("/", authentication, permission, resetcache, ItemController.add);

//api/item
router.put("/", authentication, permission, resetcache, ItemController.edit);

//api/item
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  ItemController.remove
);

//api/item/destroy
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  ItemController.updatestatus
);

module.exports = router;
