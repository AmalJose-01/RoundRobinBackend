const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const Registration = require("../model/registration");
const registrationController = require("../controller/registrationController");

jest.mock("../model/registration", () => ({
  create: jest.fn(),
}));

const app = express();
app.use(express.json());

app.post("/api/v1/account/registration/", registrationController.registration);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("REGISTER API", () => {


    console.log("REGISTER================================");
    
    it("should return 404 if require arguments are missing", async () => {

        const res = await request(app).post("/api/v1/account/registration/").send({
            firstName: "abc",
      lastName: "xyz",
      emailID: "xyz@gmail.com",
      password: "qwer",
      phoneNumber: "89564878",
      street: "z",
      city: "x",
      state: "c",
      postcode: "0000",
      gender: "",
      dob: "20/04/1991",
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Incomplete input data!")


    });


});
