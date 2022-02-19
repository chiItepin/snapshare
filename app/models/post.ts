import {Schema, model, PaginateModel} from 'mongoose';
import {IPost, IComment, IImages, ILike} from './types/post';
import mongoosePaginate from 'mongoose-paginate-v2';

const PostImagesSchema = new Schema<IImages>({
  url: {
    type: String,
    required: [true, 'An url is required'],
  },
}, {timestamps: false});

const PostCommentSchema = new Schema<IComment>({
  content: {
    type: String,
    trim: true,
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
    trim: true,
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
const Post = model<IPost, PaginateModel<IPost>>('post', PostSchema);

// const PostLike = model<ILike>('postLike', PostLikesSchema);

/**
 * getPosts - returns a list of posts
 * @param {{}} query
 * @param {number} page
 * @param {number} limit
 * @return {{}}
 */
export const getPosts = async (
    query: any,
    page: number = 1,
    limit: number = 10) => {
  try {
    return await Post.paginate(query, {
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

export const getPost = async (query: any) => {
  try {
    return await Post.findOne(query)
        .populate('authorId')
        .populate('comments.authorId', ['-image']);
  } catch (err) {
    console.log(err);
    throw Error('Error while retrieving Post');
  }
};

export const create = async (body: any, session = null) => {
  try {
    const createdPost = await Post.create([body], {session: session});
    const postId = createdPost[0].id;
    return await Post.findOne({_id: postId}, null, {session: session})
        .populate('authorId', '-password');
  } catch (err) {
    console.log(err);
    throw Error('Error while creating Post');
  }
};

export default Post;
