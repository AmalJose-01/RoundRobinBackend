const express = require("express");
const loginController = require("../controller/loginController");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/login", loginController.login);
router.post("/updatepassword", auth, loginController.updatePassword);

module.exports = router;
