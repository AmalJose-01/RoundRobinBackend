const express = require("express")
const registrationController = require("../controller/registrationController")
const validateRegistration = require("../middleware/validateRegistration")

const router = express.Router()

router.post("/account/registration/",validateRegistration,registrationController.registration)

module.exports = router