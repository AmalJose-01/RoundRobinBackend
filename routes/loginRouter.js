const express = require("express");
const loginController = require("../controller/loginController");
const router = express.Router();
const auth = require("../middleware/auth");
const authForToken = require("../middleware/authForToken");

router.post("/login", loginController.login);
router.post("/updatepassword", auth, loginController.updatePassword);
router.get("/updatetoken", authForToken, loginController.resetToken);


module.exports = router;
