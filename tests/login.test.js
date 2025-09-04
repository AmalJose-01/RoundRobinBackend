const request = require("supertest");
const express = require("express");

// mock env vars
process.env.SECURITY_KEY = "testsecret";
process.env.REFRESH_KEY = "testrefresh";

// mock Registration model
jest.mock("../model/registration", () => ({
  findOne: jest.fn(),
}));

const Registration = require("../model/registration");
const loginController = require("../controller/loginController");

const app = express();
app.use(express.json());
app.post("/api/v1/login", loginController.login);

describe("Login API", () => {
  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/v1/login").send({
      password: "123456",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(app).post("/api/v1/login").send({
      emailID: "test@example.com",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
  });

  it("should return 200 if login successful", async () => {
    const mockUser = {
      _id: "123",
      emailID: "test@example.com",
      password: "hashed",
      comparePassword: jest.fn().mockResolvedValue(true),
      toObject: function () {
        return { _id: this._id, emailID: this.emailID };
      },
    };

    Registration.findOne.mockReturnValue({
      select: jest.fn(() => Promise.resolve(mockUser)),
    });

    const res = await request(app).post("/api/v1/login").send({
      emailID: "test@example.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.emailID).toBe("test@example.com");
  });
});
