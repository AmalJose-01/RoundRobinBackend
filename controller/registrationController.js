const Registration = require("../model/registration");
const jwt = require("jsonwebtoken");
require("dotenv");

const registrationController = {
  registration: async (req, res) => {

    console.log("registration......");
    
    const {
      firstName,
      lastName,
      emailID,
      password,
      phoneNumber,
      street,
      city,
      state,
      postcode,
      gender,
      dob,
    } = req.body;
    //============================================================
    //Internal Validation
    //============================================================
    if (
      !firstName ||
      !lastName ||
      !emailID ||
      !password ||
      !phoneNumber ||
      !street ||
      !city ||
      !state ||
      !postcode ||
      !dob
    ) {
      res.status(404).json({
        status: 404,
        massage: "Incomplete input data!",
      });
    }
    try {
            console.log("registration......1");

      const registrationResponse = await Registration.create({
        firstName,
        lastName,
        emailID,
        password,
        phoneNumber,
        street,
        city,
        state,
        postcode,
        gender,
        dob,
      });

      //Save failure
      if (!registrationResponse) {
        return res.status(400).json({
          status: 400,
          message: "Failed to create restaurant",
        });
      }


      console.log("registration......2");
      const payLoad = {
        id: registrationResponse._id,
        emailID,
      };

      const token = jwt.sign(payLoad, process.env.SECURITY_KEY);

      console.log("token....",token);
      



      return res.status(201).json({
        status: 201,
        token: token,
        message: "User created successfully",
        user: registrationResponse
      });
    } catch (error) {
      console.log("registration error === ",error);


      console.error("Error creating user:", error.message);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message);

        return res.status(400).json({
          status: 400,
          details: errors,
        });
      }

      console.log("registration error === ",err);
      

      
      res.status(500).json({
        status: 500,
        details: error.message,
      });
    }
  },
};

module.exports = registrationController;
