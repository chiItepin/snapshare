const {v4: uuidv4} = require('uuid');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for User
const UserSchema = new Schema({
  _id: {type: String,
    default: uuidv4,
  },
  email: {
    type: String,
    required: [true, 'An email is required'],
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'A valid password is required'],
  },
}, {timestamps: true});

// create model for User
const User = mongoose.model('user', UserSchema);

exports.getUsers = async (query, page, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    return await User.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt');
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Users');
  }
};

exports.getUser = async (query) => {
  try {
    return await User.findOne(query);
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving User');
  }
};

exports.create = async (body, session) => {
  try {
    return await User.create([body], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while creating User');
  }
};