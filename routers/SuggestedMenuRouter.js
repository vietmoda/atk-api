const express = require("express");
const router = express.Router();
const SuggestedMenuController = require("../controllers/SuggestedMenuController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/suggestedmenus/
router.get(
  "/",
  authentication,
  permission,
  caching,
  SuggestedMenuController.getall
);
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  SuggestedMenuController.add
);
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  SuggestedMenuController.edit
);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  SuggestedMenuController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  SuggestedMenuController.updatestatus
);
//router.put("/deleteimage", authentication, resetcache, SuggestedMenuController.deleteimage);

module.exports = router;
