const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema for User
const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'An email is required'],
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Invalid email format'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'A valid password is required'],
    select: false,
  },
  image: {
    type: String,
  },
}, {timestamps: true});

// create model for User
exports.User = mongoose.model('user', UserSchema);

exports.getUsers = async (query, page, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    return await exports.User.find(query)
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
    return await exports.User.findOne(query);
    // .select('+password')
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving User');
  }
};

exports.create = async (body, session) => {
  try {
    return await exports.User.create([body], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while creating User');
  }
};
