const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const Registration = require("../model/registration");
const loginController = require("../controller/loginController");
const { sanitizeFilter } = require("mongoose");


jest.mock("../model/registration", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));



const app = express();
app.use(express.json());

// Routes
app.post("/api/v1/login", loginController.login);
app.post("/api/v1/update-password", (req, res) => {
  req.userId = "123"; // simulate middleware adding userId
  return loginController.updatePassword(req, res);
});




beforeEach(() => {
  jest.clearAllMocks();
});

// ------------------- LOGIN TESTS -------------------
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

  it("should return 400 if user not found", async () => {
    Registration.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).post("/api/v1/login").send({
      emailID: "test@example.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("should return 401 if password is incorrect", async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    Registration.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app).post("/api/v1/login").send({
      emailID: "test@example.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

 it("should return 200 if Login successful", async () => {
  const mockUser = {
    _id: "123",
    emailID: "test@example.com",
    comparePassword: jest.fn().mockResolvedValue(true),
    toObject: function () {
      return { _id: this._id, emailID: this.emailID };
    },
  };

  Registration.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser),
  });

  jest.spyOn(jwt, "sign").mockImplementation(() => "fakeToken");

  const res = await request(app).post("/api/v1/login").send({
    emailID: "test@example.com",
    password: "123456",
  });

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Login successful");
  expect(res.body).toHaveProperty("accessToken", "fakeToken");
  expect(res.body).toHaveProperty("refreshToken", "fakeToken");
  expect(res.body.user.emailID).toBe("test@example.com");
});


});

// ------------------- UPDATE PASSWORD TESTS -------------------
describe("Update Password API", () => {
  it("should return 400 if new password is missing", async () => {
    const res = await request(app).post("/api/v1/update-password").send({
      currentPassword: "oldpass",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
  });

  it("should return 404 if Unable to fine user", async () => {
    Registration.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).post("/api/v1/update-password").send({
      currentPassword: "oldpass",
      password: "newpass",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Unable to fine user");
  });



  it("should return 401 if Incorrect current password", async () => {
    const mockUser = {
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    Registration.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app).post("/api/v1/update-password").send({
      currentPassword: "wrongpass",
      password: "newpass",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect current password");
  });



it("should return 500 if Unable to update the password", async () => {
  Registration.findById.mockReturnValue({
    password: 'hashedOldPassword',
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(null),
  });

  const res = await request(app).post("/api/v1/update-password").send({
    currentPassword: "oldpass",
    password: "newpass",
  });

  console.log(res.body); // For debugging

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Unable to update the password");
});





  it("should return 201 if password updated successfully", async () => {
    const mockUser = {
      password: "hashed",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
      _id: "123",
      emailID: "test@example.com",
    }),
    };

    Registration.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const res = await request(app).post("/api/v1/update-password").send({
      currentPassword: "oldpass",
      password: "newpass",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Password updated successfully");
  });


});
