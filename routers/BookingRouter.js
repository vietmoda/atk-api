const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/bookings/
router.get("/", authentication, permission, caching, BookingController.getall);
router.get(
  "/getwithtotal",
  authentication,
  permission,
  caching,
  BookingController.getwithtotal
);
router.get(
  "/getpaging",
  authentication,
  permission,
  caching,
  BookingController.getpaging
);
router.get(
  "/count",
  authentication,
  permission,
  caching,
  BookingController.count
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  BookingController.getbyid
);
router.post("/", authentication, permission, resetcache, BookingController.add);
router.put("/", authentication, permission, resetcache, BookingController.edit);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  BookingController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  BookingController.updatestatus
);
router.put(
  "/updateprocess",
  authentication,
  resetcache,
  BookingController.updateprocess
);

module.exports = router;
