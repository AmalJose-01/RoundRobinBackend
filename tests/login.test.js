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
app.post("/api/v1/updatepassword", loginController.updatePassword);



  // Mock req.userId middleware for updatePassword
  app.use(req,res,next=>{
    req.userId = "123";
    next();
  });


  app.post("/api/v1/login", (req, res) => {
    loginController.login(req, res);
  });

app.post("/api/v1/updatepassword", (req, res) => {
  loginController.updatePassword(req, res);
});


describe("Login API", () => {

// clears call counts & args before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });


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

  // ====================== UPDATE PASSWORD TESTS ======================

  it("should return 400 if oldPassword is missing in updatePassword", async () => {
    const res = await request(app).post("/api/v1/updatepassword").send({
      oldPassword: "newpass123",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Old password is required");
  });

  it("should return 400 if newPassword is missing in updatePassword", async () => {
    const res = await request(app).post("/api/v1/updatepassword").send({
      newPassword: "oldpass123",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("New password is required");
  });

  it("updatePassword: should return 400 if current password is incorrect", async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    Registration.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/v1/update-password")
      .send({ password: "NewPass123@", currentPassword: "wrongpass" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Incorrect current password");
  });

  it("updatePassword: should return 201 if password updated successfully", async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      password: "",
    };
    Registration.findById.mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/v1/update-password")
      .send({ password: "NewPass123@", currentPassword: "oldpass" });

    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Password updated");
  });


});