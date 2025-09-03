const express = require("express")
const  registrationRouter  = require("./registrationRouter")
const  loginRouter  = require("./loginRouter")



const router = express()

//Login And Register
router.use("/roundrobin",registrationRouter)
router.use("/roundrobin",loginRouter)

module.exports = router