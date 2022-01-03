const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
    type: Schema.Types.ObjectId,
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

const PostLikesSchema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

// create schema for Post
const PostSchema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
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

PostSchema.plugin(mongoosePaginate);

// create model for Post
exports.Post = mongoose.model('post', PostSchema);
exports.PostLike = mongoose.model('postLike', PostLikesSchema);

/**
 * getPosts - returns a list of posts
 * @param {{}} query
 * @param {number} page
 * @param {number} limit
 * @return {{}}
 */
exports.getPosts = async (query, page = 1, limit = 10) => {
  try {
    return await exports.Post.paginate(query, {
      sort: '-createdAt',
      page,
      limit,
      populate: [{path: 'authorId', select: '-password'}],
    });
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Posts');
  }
};

exports.getPost = async (query) => {
  try {
    return await exports.Post.findOne(query).populate('authorId', '-password');
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Post');
  }
};

exports.create = async (body, session = null) => {
  try {
    const createdPost = await exports.Post.create([body], {session: session});
    const postId = createdPost[0].id;
    return await exports.Post.findOne({_id: postId}, null, {session: session})
        .populate('authorId', '-password');
  } catch (err) {
    console.log(err);
    throw Error('Error while creating Post');
  }
};
