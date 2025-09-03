const mongoose = require("mongoose")

require("dotenv").config()

const uri = process.env.URI

const databaseConnection = async () => {
    try {

        await mongoose.connect(uri)
        console.log("DB Connected ....");

        
    } catch (error) {
                 console.log("error ....",error);

    }

}

module.exports = databaseConnection