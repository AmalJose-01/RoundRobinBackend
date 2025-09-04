const jwt = require("jsonwebtoken");
const Registration = require("../model/registration");

require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    console.log("auth req", req);

    const token = req.headers.authorization.split(" ")[1];

    console.log("token", token);

    if (!token) {
      res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const verifyToken = jwt.verify(token, process.env.SECURITY_KEY);

    console.log("verifyToken", verifyToken);

    if (!verifyToken) {
      res.status(403).json({
        message: "Invalid token",
      });
    }

    const loginDetail = await Registration.findById(verifyToken.id).select(
      "_id"
    );

    console.log("loginDetail", loginDetail);

    req.userId = loginDetail.id;

    next();
  } catch (error) {
    console.log("auth/error", error);

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Token expired. Please login again.",
      });
    }

    res.status(500).json({
      status: 500,
      details: "Internal Server Error",
    });
  }
};

module.exports = auth;
