const express = require("express");
const router = express.Router();
const ArtifactController = require("../controllers/ArtifactController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const permission = require("../middleware/permission");

//api/artifacts
router.get("/", authentication, permission, caching, ArtifactController.getall);

//api/categories/byid
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  ArtifactController.getbyid
);

//api/categories
router.post("/", authentication, permission, ArtifactController.add);

//api/categories/destroy
router.put(
  "/updatestatus",
  authentication,
  permission,
  CategoryController.updatestatus
);

//api/categories
router.put("/", authentication, permission, ArtifactController.edit);

//api/categories/
router.delete("/", authentication, permission, ArtifactController.remove);

module.exports = router;
