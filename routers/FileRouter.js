const express = require("express");
const router = express.Router();
const FileController = require("../controllers/FileController");
const file = require("../middleware/file");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");
//api/file
//api/file/byid
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  FileController.getbyid
);
//api/file/bysource
router.get(
  "/bysource",
  authentication,
  permission,
  caching,
  FileController.getbysource
);
//
router.post(
  "/",
  authentication,
  permission,  
  file.upload.array("files"),
  resetcache,
  FileController.add
);
//router.delete('/', authentication, delefile.delete('fileurl'), FileController.remove)
//delete
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  FileController.remove
);
router.delete(
  "/multi",
  authentication,
  permission,
  resetcache,
  FileController.removemulti
);

module.exports = router;
