const express = require("express")
const  registrationRouter  = require("./registrationRouter")


const router = express()

router.use("/roundrobin",registrationRouter)

module.exports = router