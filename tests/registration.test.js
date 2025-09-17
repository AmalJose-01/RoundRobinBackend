const registrationController = require('../controller/registrationController');
const Registration = require('../model/registration');
const jwt = require('jsonwebtoken');
const { param } = require('../routes');
const { text } = require('express');

// Mock dependencies
jest.mock('../model/registration');
jest.mock('jsonwebtoken');

describe('registrationController.registration', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'Amal',
        lastName: 'Jose',
        emailID: 'amal@example.com',
        password: '123456',
        phoneNumber: '1234567890',
        street: 'Main St',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        gender: 'Male',
        dob: '1990-01-01',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // 1. Missing input
  test('should return 400 if required input is missing', async () => {
    req.body.firstName = ''; // invalidate

    await registrationController.registration(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      massage: 'Incomplete input data!',
    });
  });

  // 2. Save failure
  test('should return 500 if Registration.create() returns null', async () => {
    Registration.create.mockResolvedValue(null);

    await registrationController.registration(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Failed to registration',
    });
  });

  // 3. Success case
  test('should return 201 and token when registration succeeds', async () => {
    const fakeUser = { _id: '123', ...req.body };
    Registration.create.mockResolvedValue(fakeUser);

    const fakeToken = 'fake-jwt-token';
    jwt.sign.mockReturnValue(fakeToken);

    await registrationController.registration(req, res);

    expect(Registration.create).toHaveBeenCalledWith(req.body);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: fakeUser._id, emailID: req.body.emailID },
      process.env.SECURITY_KEY
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      token: fakeToken,
      message: 'User created successfully',
      user: fakeUser,
    });
  });

  // 4. ValidationError
  test('should return 400 with details when ValidationError occurs', async () => {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    validationError.errors = {
      emailID: { message: 'Email is required' },
      password: { message: 'Password is required' },
    };
    Registration.create.mockRejectedValue(validationError);

    await registrationController.registration(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      details: ['Email is required', 'Password is required'],
    });
  });

  // 5. Other errors
  test('should return 500 for unexpected errors', async () => {
    const unknownError = new Error('DB connection failed');
    Registration.create.mockRejectedValue(unknownError);

    await registrationController.registration(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      details: 'Internal Server Error',
    });
  });
});


describe('registrationController.updateUser',() => {
  let req,res;

   beforeEach(() => {
    req = {
      params: { id: '123' },
      body: {
        firstName: 'Amal',
        lastName: 'Jose',
        phoneNumber: '1234567890',
        street: 'Main St',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
      },
      userId: '123', // simulate authenticated user ID
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

//1. success case
 it('should return 200 and updated user when update succeeds', async () => {
    const fakeUser = { _id: '123', ...req.body };
    Registration.findByIdAndUpdate.mockResolvedValue(fakeUser);

    await registrationController.updateUser(req, res);

    // DB method called with correct args
    expect(Registration.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      req.body,
    );

    // Correct response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      message: 'User updated successfully',
      user: fakeUser,
    });
  });

//2. user not found
it('should return 404 if user not found', async () => {
  Registration.findByIdAndUpdate.mockResolvedValue(null);

  await registrationController.updateUser(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    status: 404,
    message: 'User not found',
  });   
});
//3. ValidationError
it('should return 400 with details when ValidationError occurs', async () => {
  const validationError = new Error('Validation failed');
  validationError.name = 'ValidationError';
  validationError.errors = {
    firstName: { message: 'First name is required' },
    lastName: { message: 'Last name is required' },
    phoneNumber: { message: 'Phone number is required' },
  };
  Registration.findByIdAndUpdate.mockRejectedValue(validationError);

  await registrationController.updateUser(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    status: 400,
    details: ['First name is required', 'Last name is required', 'Phone number is required'],
  });   
});
  

});
