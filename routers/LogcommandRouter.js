const express = require("express");
const router = express.Router();
const LogcommandController = require("../controllers/LogCommandController");
const authentication = require("../middleware/authentication");
const permission = require("../middleware/permission");

//api/logcommands
router.get(
  "/getwithtotal",
  authentication,
  permission,
  LogcommandController.getwithtotal
);
router.get(
  "/searchlog",
  authentication,
  permission,
  LogcommandController.searchlog
);
router.get("/count", authentication, permission, LogcommandController.count);

module.exports = router;
