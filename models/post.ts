import {Schema, model} from 'mongoose';
import {Request} from 'express';
import {IPost, IComment, IImages, ILike} from './types/post';
const mongoosePaginate = require('mongoose-paginate-v2');

const PostImagesSchema = new Schema<IImages>({
  url: {
    type: String,
    required: [true, 'An url is required'],
  },
}, {timestamps: true});

const PostCommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

const PostLikesSchema = new Schema<ILike>({
  authorId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Author Id is required'],
  },
}, {timestamps: true});

// create schema for Post
const PostSchema = new Schema<IPost>({
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
    type: [String],
    default: [],
  },
  categories: {
    type: [String],
    default: [],
  },
}, {timestamps: true});

PostSchema.plugin(mongoosePaginate);

// create model for Post
exports.Post = model<IPost>('post', PostSchema);
exports.PostLike = model<ILike>('postLike', PostLikesSchema);

/**
 * getPosts - returns a list of posts
 * @param {{}} query
 * @param {number} page
 * @param {number} limit
 * @return {{}}
 */
exports.getPosts = async (query: Request, page = 1, limit = 10) => {
  try {
    return await exports.Post.paginate(query, {
      sort: '-createdAt',
      page,
      limit,
      populate: [{path: 'authorId'}],
    });
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Posts');
  }
};

exports.getPost = async (query: Request) => {
  try {
    return await exports.Post.findOne(query)
        .populate('authorId')
        .populate('comments.authorId', ['-image']);
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Post');
  }
};

exports.create = async (body: any, session = null) => {
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
