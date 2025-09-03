const mongoose = require("mongoose")
const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence')(mongoose);

const registrationSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: [true, "First name is  required"]
    },
    lastName:{
        type: String,
        required: [true, "Last name is  required"]
    },
    emailID:{
        type: String,
        required: [true, "EmailID name is  required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // basic email regex
            "Please enter a valid email address"
        ]
    },
    password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    trim: true,
    validate: {
      validator: function (v) {
        // Password must have at least one uppercase, one lowercase, one digit, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: props =>
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    match: [
      /^\+?[1-9]\d{1,14}$/, // E.164 international format
      "Please enter a valid phone number"
    ]
  },
  street: {
      type: String,
      required: [true, "Street is required"],
      trim: true
  },
  city: {
      type: String,
      required: [true, "City is required"],
      trim: true
  },
  state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      uppercase: true,
      enum: {
        values: [
          "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"
        ],
        message: "State must be a valid Australian state abbreviation"
      }
  },
  postcode: {
      type: String,
      required: [true, "Postcode is required"],
      trim: true,
      match: [/^\d{4}$/, "Postcode must be 4 digits"]
    }
    
},{timestamps: true});

registrationSchema.plugin(AutoIncrement, {inc_field: "regId"})

const Registration = mongoose.model =("Registration",registrationSchema)

module.exports = Registration