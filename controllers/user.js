const User = require('../models/user');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

require('dotenv').config();

exports.getUsers = async function(req, res, next) {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 20;

  try {
    const users = await User.getUsers({}, page, limit);

    return res.status(200).json({
      status: 200,
      data: users,
      message: 'List of users',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

exports.create = async function(req, res, next) {
  const page = req.query.page ? req.query.page : 1;
  const limit = req.query.limit ? req.query.limit : 10;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {email, password, confirmPassword = ''} = req.body;

    if (!email) {
      return res.status(400).json({
        status: 400, message: 'Email must be entered'});
    }
    if (!password || password.length < 4) {
      return res.status(400).json({
        status: 400, message: 'Password must be entered'});
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 400, message: 'Confirm your password'});
    }

    const checkUser = await User.getUser({email: email}, page, limit);
    if (checkUser) {
      return res.status(400).json({
        status: 400, message: 'User already exists'});
    }

    // Hash password
    const hashedPassword = passwordHash.generate(password);
    req.body.password = hashedPassword;

    const createdUser = await User.create(req.body, session);

    // Generate auth token
    const authToken = jwt.sign({
      email: email,
      id: createdUser.id,
    }, process.env.TOKEN_SECRET, {expiresIn: '7d'});

    await session.commitTransaction();

    return res.status(200).json({
      status: 200,
      data: createdUser,
      message: 'Account created',
      token: authToken,
    });
  } catch (err) {
    await session.abortTransaction();
    console.log(err);
    return res.status(400).json({
      status: 400,
      message: err?.message || 'Unknown error',
    });
  } finally {
    session.endSession();
  }
};

exports.logIn = async function(req, res, next) {
  try {
    const {email, password} = req.body;

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: 'Email must be provided',
      });
    }
    if (!password) {
      return res.status(400).json({
        status: 400,
        message: 'Password must be provided',
      });
    }

    // Hash password
    const checkUser = await User.getUser({email: email});
    if (checkUser) {
      if (passwordHash.verify(password, checkUser.password)) {
        // Generate auth token
        const authToken = jwt.sign({
          email: checkUser.email,
          id: checkUser.id,
        }, process.env.TOKEN_SECRET, {expiresIn: '7d'});

        return res.status(200).json({
          status: 200,
          data: authToken,
          message: 'Account authenticated',
        });
      } else {
        // Password does not match
        return res.status(404).json({
          status: 404,
          message: 'Account not found',
        });
      }
    } else {
      return res.status(404).json({status: 404, message: 'Account not found'});
    }
  } catch (err) {
    return res.status(400).json({status: 400, message: err?.message || ''});
  }
};
