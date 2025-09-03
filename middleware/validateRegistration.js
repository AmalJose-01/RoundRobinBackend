const validator = require("validator");
const Registration = require("../model/registration");


const validateRegistration = async (req, res, next) => {
  try {
    const { emailID } = req.body;



    console.log("validateRegistration....");
    
    // 1. Check format first
    if (!emailID || !validator.isEmail(emailID)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid EmailID is required" });
    }

    // 2. Check if user already exists
    const existingUser = await Registration.findOne({ emailID });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    next();
  } catch (error) {
    console.log("validateRegistration:===",error);
    
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = validateRegistration;
