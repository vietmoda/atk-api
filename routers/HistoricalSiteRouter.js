const express = require("express");
const router = express.Router();
const HistoricalSiteController = require("../controllers/HistoricalSiteController");
const HistoricalSiteUpgradeController = require("../controllers/HistoricalSiteUpgradeController");
const HistoricalSiteFestivalController = require("../controllers/HistoricalSiteFestivalController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");
//api/historicalsite
router.get(
  "/",
  authentication,
  permission,
  caching,
  HistoricalSiteController.getall
);
router.get(
  "/getbyid",
  authentication,
  permission,
  caching,
  HistoricalSiteController.getbyid
);
router.post(
  "/",
  authentication,
  permission,
  resetcache,
  HistoricalSiteController.add
);
router.put(
  "/",
  authentication,
  permission,
  resetcache,
  HistoricalSiteController.edit
);
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  HistoricalSiteController.remove
);
router.put(
  "/updatestatus",
  authentication,
  permission,
  resetcache,
  HistoricalSiteController.updatestatus
);

//api/historicalsite/upgrade =================================================================================
router.get(
  "/upgrades",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.getall
);
router.get(
  "/upgrades/byid",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.getbyid
);
router.post(
  "/upgrades",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.add
);
router.put(
  "/upgrades",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.edit
);
router.delete(
  "/upgrades",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.remove
);
router.put(
  "/upgrades/updatestatus",
  authentication,
  permission,
  resetcache,
  HistoricalSiteUpgradeController.updatestatus
);

//api/historicalsite/festival

router.get(
  "/festivals",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.getall
);
router.get(
  "/festivals/byid",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.getbyid
);
router.post(
  "/festivals",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.add
);
router.put(
  "/festivals",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.edit
);
router.delete(
  "/festivals",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.remove
);
router.put(
  "/festivals/updatestatus",
  authentication,
  permission,
  resetcache,
  HistoricalSiteFestivalController.updatestatus
);


//api/historicalsite/finance

module.exports = router;
