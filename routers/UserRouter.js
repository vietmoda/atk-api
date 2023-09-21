const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const authentication = require("../middleware/authentication");
const caching = require("../middleware/caching");
const resetcache = require("../middleware/resetcache");
const permission = require("../middleware/permission");

//api/user
//get method
router.get("/", authentication, permission, caching, UserController.getall);
router.get(
  "/byid",
  authentication,
  permission,
  caching,
  UserController.getbyid
);
router.get(
  "/byusername",
  authentication,
  permission,
  caching,
  UserController.getbyusername
);
router.get(
  "/checkrole",
  authentication,
  permission,
  caching,
  UserController.checkrole
);
//router.get('/search', authentication, UserController.search)

//post method
router.post("/", authentication, permission, resetcache, UserController.add);
//router.post('/',permission, resetcache, UserController.add)
//put method
router.put("/", authentication, permission, resetcache, UserController.edit);
router.put(
  "/destroy",
  authentication,
  permission,
  resetcache,
  UserController.destroy
);
router.put("/login", UserController.login);
router.put(
  "/grandrole",
  authentication,
  permission,
  resetcache,
  UserController.grandrole
);
//delete method
router.delete(
  "/",
  authentication,
  permission,
  resetcache,
  UserController.remove
);

module.exports = router;
