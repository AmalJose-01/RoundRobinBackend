const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment");


const AutoIncrement = require("mongoose-sequence")(mongoose);

const registrationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is  required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is  required"],
    },
    emailID: {
      type: String,
      required: [true, "EmailID name is  required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // basic email regex
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 8 characters long"],
      trim: true,
      validate: {
        validator: function (v) {
          // Password must have at least one uppercase, one lowercase, one digit, and one special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            v
          );
        },
        message: (props) =>
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false, // never include by default in queries

    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/, // E.164 international format
        "Please enter a valid phone number",
      ],
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      uppercase: true,
      enum: {
        values: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
        message: "State must be a valid Australian state abbreviation",
      },
    },
    postcode: {
      type: String,
      required: [true, "Postcode is required"],
      trim: true,
      match: [/^\d{4}$/, "Postcode must be 4 digits"],
    },
    gender: {
      type: String,
      enum: ["M", "F", "MALE", "FEMALE"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
      set: (value) => {
        // If value is string like "20/04/1991", convert it
        if (typeof value === "string") {
          return moment(value, "MM/DD/YYYY").toDate();
        }
        return value;
      },
    }
  },
  { timestamps: true }
);

registrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if modified or new

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered password with stored hash
registrationSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

registrationSchema.plugin(AutoIncrement, { inc_field: "regId" });

const Registration = mongoose.model("Registration", registrationSchema);

module.exports = Registration;
