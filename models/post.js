const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostImagesSchema = new Schema({
  url: {
    type: String,
    required: [true, 'An url is required'],
  },
}, {timestamps: true});

const PostCommentSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  authorId: {
    type: String,
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

const PostLikesSchema = new Schema({
  authorId: {
    type: String,
    unique: true,
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

// create schema for Post
const PostSchema = new Schema({
  authorId: {
    type: String,
    required: [true, 'Author Id is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  images: [PostImagesSchema],
  comments: [PostCommentSchema],
  likes: [PostLikesSchema],
  tags: {
    type: Array,
    default: [],
  },
  categories: {
    type: Array,
    default: [],
  },
}, {timestamps: true});

// create model for Post
exports.Post = mongoose.model('post', PostSchema);

exports.getPosts = async (query, page, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    return await exports.Post.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt');
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Posts');
  }
};

exports.getPost = async (query) => {
  try {
    return await exports.Post.findOne(query);
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Post');
  }
};

exports.create = async (body, session = null) => {
  try {
    return await exports.Post.create([body], {session: session});
  } catch (err) {
    console.log(err);
    throw Error('Error while creating Post');
  }
};
