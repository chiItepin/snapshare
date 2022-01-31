"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const PostImagesSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: [true, 'An url is required'],
    },
}, { timestamps: false });
const PostCommentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Author Id is required'],
    },
}, { timestamps: true });
const PostLikesSchema = new mongoose_1.Schema({
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, 'Author Id is required'],
    },
}, { timestamps: true });
// create schema for Post
const PostSchema = new mongoose_1.Schema({
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
PostSchema.plugin(mongoose_paginate_v2_1.default);
// create model for Post
exports.Post = (0, mongoose_1.model)('post', PostSchema);
exports.PostLike = (0, mongoose_1.model)('postLike', PostLikesSchema);
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
            populate: [{ path: 'authorId' }],
        });
    }
    catch (err) {
        console.log(err);
        throw Error('Error while retrieving Posts');
    }
};
exports.getPost = async (query) => {
    try {
        return await exports.Post.findOne(query)
            .populate('authorId')
            .populate('comments.authorId', ['-image']);
    }
    catch (err) {
        console.log(err);
        throw Error('Error while retrieving Post');
    }
};
exports.create = async (body, session = null) => {
    try {
        const createdPost = await exports.Post.create([body], { session: session });
        const postId = createdPost[0].id;
        return await exports.Post.findOne({ _id: postId }, null, { session: session })
            .populate('authorId', '-password');
    }
    catch (err) {
        console.log(err);
        throw Error('Error while creating Post');
    }
};
//# sourceMappingURL=post.js.map