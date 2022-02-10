import {Request} from 'express';
import {startSession} from 'mongoose';
import {handleUserNotFound} from '../helpers';
import {IAuthResponse} from '../../middleware/auth';
import {IPost, IComment, ILike} from '../../models/types/post';
import IUser from '../../models/types/user';
import Notification from '../../models/notification';
const Post = require('../../models/post');
const User = require('../../models/user');

exports.getPosts = async function(req: Request, res: IAuthResponse) {
  const page = req?.query?.page || 1;
  const limit = req?.query?.limit || 20;

  try {
    const posts = await Post.getPosts({}, page, limit);

    return res.status(200).json({
      status: 200,
      data: posts,
      message: 'List of posts',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

exports.getSinglePost = async function(req: Request, res: IAuthResponse) {
  try {
    const postId = req?.params?.id;

    const post = await Post.getPost({_id: postId});

    return res.status(200).json({
      status: 200,
      data: post,
      message: 'Post retrieved',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

exports.createComment = async function(req: Request, res: IAuthResponse) {
  const session = await startSession();
  session.startTransaction();
  try {
    const postId = req?.params?.id || '';
    const commentAuthorId = res.userId;
    const commentAuthorUser: IUser = await User.getUser({_id: commentAuthorId});

    if (!commentAuthorUser) {
      handleUserNotFound(res);
    }

    const comment: IComment = {...req.body, authorId: commentAuthorId};
    comment.content = comment.content.replace(/(\r\n|\n|\r)/gm, '');

    const {content} = comment;
    if (!content || !postId) {
      return res.status(400).json({
        status: 400,
        message: 'Content is required',
      });
    }

    const post: IPost = await Post.getPost({_id: postId});
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found',
      });
    }

    if (commentAuthorId !== post.authorId.id) {
    // handle new notification to post owner
      await Notification.create([{
        userId: post.authorId.id,
        type: 'post',
        message: `${commentAuthorUser.email}: ${content}`,
        resourceId: post._id,
      }], {session});
    }

    post.comments.unshift(comment);
    await post.save({session});

    await session.commitTransaction();

    const newPost: IPost = await Post.getPost({_id: postId});

    return res.status(201).json({
      status: 201,
      data: newPost,
      message: 'Comment created successfully',
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

exports.createPost = async function(req: Request, res: IAuthResponse) {
  const session = await startSession();
  session.startTransaction();
  try {
    const post: IPost = {...req.body, authorId: {_id: res.userId}};

    post.content = post.content.replace(/(\r\n|\n|\r)/gm, '');
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

exports.updatePostLike = async function(
    req: Request,
    res: IAuthResponse,
) {
  try {
    const userId = res.userId;
    const postId = req.params.id;

    const post: IPost = await Post.getPost({_id: postId});
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: 'Post not found',
      });
    }

    const userLikes = post.likes
        .filter((like) => like.authorId?.toString() === userId);
    if (userLikes.length) {
      // user already liked the post, needs to be removed
      post.likes = post.likes
          .filter((like) => like.authorId?.toString() !== userId);
    } else {
      // push new like
      const newLike: ILike = {
        authorId: userId,
      };
      post.likes.push(newLike);
    }

    await post.save();

    return res.status(200).json({
      status: 200,
      data: post,
      message: 'Post updated',
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 400,
      message: err?.message || 'Unknown error',
    });
  }
};

exports.updatePost = async function(req: Request, res: IAuthResponse) {
  const session = await startSession();
  session.startTransaction();
  try {
    const post = {...req.body};

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

exports.deletePost = async function(req: Request, res: IAuthResponse) {
  const session = await startSession();
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
