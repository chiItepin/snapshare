const Post = require('../models/post');
const mongoose = require('mongoose');

exports.getPosts = async function(req, res) {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 20;

  try {
    const users = await Post.getPosts({}, page, limit);

    return res.status(200).json({
      status: 200,
      data: users,
      message: 'List of posts',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

exports.createComment = async function(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const comment = {...req.body, authorId: res.userId};
    const postId = req?.params?.id;
    const {content} = comment;
    if (!content || !postId) {
      return res.status(400).json({
        status: 400,
        message: 'Content is required',
      });
    }

    const post = await Post.getPost({_id: postId});
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found',
      });
    }

    post.comments.push(comment);
    await post.save({session});

    await session.commitTransaction();

    return res.status(201).json({
      status: 201,
      data: post,
      message: 'Comment created',
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

exports.createPost = async function(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const post = {...req.body, authorId: res.userId};

    const {content} = post;
    if (!content) {
      return res.status(400).json({
        status: 400,
        message: 'Content is required',
      });
    }

    const createdPost = await Post.create(post, session);
    await session.commitTransaction();

    return res.status(201).json({
      status: 201,
      data: createdPost,
      message: 'Post created',
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

exports.updatePost = async function(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const post = {...req.body, authorId: res.userId};

    const {content} = post;
    if (!content) {
      return res.status(400).json({
        status: 400,
        message: 'Content is required',
      });
    }

    const postId = req.params.id;
    const updatedPost = await Post.Post
        .findOneAndUpdate(
            {_id: postId},
            req.body,
            {session, new: true, runValidators: true});

    await session.commitTransaction();

    return res.status(200).json({
      status: 200,
      data: updatedPost,
      message: 'Post updated',
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

exports.deletePost = async function(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const postId = req?.params?.id;

    await Post.Post
        .findOneAndDelete(
            {_id: postId},
            {session});

    await session.commitTransaction();

    return res.status(200).json({
      status: 200,
      message: 'Post deleted',
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