const express = require("express");
const router = express.Router();
const FixedDataController = require("../controllers/FixedDataController");
const authentication = require("../middleware/authentication");
const permission = require("../middleware/permission");

//api/fixeddata/
router.get(
  "/newsstatus",
  authentication,
  permission,
  FixedDataController.newsstatus
);

router.get(
  "/processstatus",
  authentication,
  permission,
  FixedDataController.processstatus
);

router.get(
  "/datastatus",
  authentication,
  permission,
  FixedDataController.datastatus
);

router.get(
  "/language",
  authentication,
  permission,
  FixedDataController.language
);

router.get(
  "/sourcetype",
  authentication,
  permission,
  FixedDataController.sourcetype
);

router.get(
  "/usertype",
  authentication,
  permission,
  FixedDataController.usertype
);

router.get(
  "/newscategorytype",
  authentication,
  permission,
  FixedDataController.newscategorytype
);

router.get(
  "/weblinkviewtype",
  authentication,
  permission,
  FixedDataController.weblinkviewtype
);

router.get(
  "/service",
  authentication,
  permission,
  FixedDataController.service
);

module.exports = router;
