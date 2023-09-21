const express = require("express");
const router = express.Router();
const OrderMenuController = require("../controllers/OrderMenuController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/ordermenus/
router.get(
  "/",
  authentication,
  permission,
  caching,
  OrderMenuController.getall
);
router.get(
  "/getwithtotal",
  authentication,
  permission,
  caching,
  OrderMenuController.getwithtotal
);
router.get(
  "/getpaging",
  authentication,
  permission,
  caching,
  OrderMenuController.getpaging
);
router.get(
  "/count",
  authentication,
  permission,
  caching,
  OrderMenuController.count
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  OrderMenuController.getbyid
);
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  OrderMenuController.add
);
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  OrderMenuController.edit
);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  OrderMenuController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  OrderMenuController.updatestatus
);
router.put(
  "/updateprocess",
  authentication,
  permission,
  resetcache,
  OrderMenuController.updateprocess
);

module.exports = router;
