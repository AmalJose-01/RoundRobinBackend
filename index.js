const express = require("express")
const databaseConnection = require("./connectionDB")
const  router  = require("./routes")
const errorHandler = require("./middleware/errorHandler")


const app = express()

databaseConnection()

app.use(express.json())
app.use("/api/v1",router)

app.use(errorHandler)
app.listen(8000, () => {
    console.log("Running Server ....");
    
})