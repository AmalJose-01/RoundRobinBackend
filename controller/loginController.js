const Registration = require("../model/registration");
const jwt = require("jsonwebtoken");
require("dotenv");

const loginController = {
  login: async (req, res) => {
    console.log("login......");

    try {
      const { emailID, password } = req.body;

      //400 Bad Request → Missing or invalid input
      if (!emailID) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }

      const userDetail = await Registration.findOne({ emailID }).select(
        "+password"
      );
      console.log("userDetail==", userDetail);
      if (!userDetail) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // 2. Compare password using the schema method
      const isMatch = await userDetail.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const payLoad = {
        id: userDetail._id,
        emailID,
      };

      const token = jwt.sign(payLoad, process.env.SECURITY_KEY, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign(payLoad, process.env.REFRESH_KEY, {
        expiresIn: "3d",
      });

      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = userDetail.toObject();

      res.status(200).json({
        message: "Login successful",
        accessToken: token,
        refreshToken: refreshToken,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.log("login error === ", error);

      console.error("Error creating user:", error.message);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message);

        return res.status(400).json({
          status: 400,
          details: errors,
        });
      }

      console.log("login error === ", err);

      res.status(500).json({
        status: 500,
        details: "Internal Server Error",
      });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { password, currentPassword } = req.body;
      console.log("login......");

      // const userId = req.userId;

      //400 Bad Request → Missing or invalid input
      if (!password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }

      const userDetail = await Registration.findById(req.userId).select(
        "+password"
      );
      if (!userDetail) {
        res.status(404).json({
          message: "User not found",
        });
      }

      const isMatch = await userDetail.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({
          message: "Incorrect current password",
        });
      }

      // assign new password (hook will hash it)
      userDetail.password = password;
      const updateResponse = await userDetail.save();

      console.log("updateResponse", updateResponse);

      if (!updateResponse) {
        return res.status(400).json({
          status: 400,
          message: "Unable to update the password",
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.log("login error === ", error);

      console.error("Error creating user:", error.message);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message);

        return res.status(400).json({
          status: 400,
          details: errors,
        });
      }

      console.log("login error === ", err);

      res.status(500).json({
        status: 500,
        details: "Internal Server Error",
      });
    }
  },


};

module.exports = loginController;
