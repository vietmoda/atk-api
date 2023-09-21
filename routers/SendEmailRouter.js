const express = require("express");
const router = express.Router();
const SendEmailController = require("../controllers/SendEmail");
const authentication = require("../middleware/authentication");
const permission = require("../middleware/permission");

router.post("/sendtext", authentication, permission, SendEmailController.sendtextemail);
router.post("/sendhtml", authentication, permission, SendEmailController.sendhtmlemail);

module.exports = router
