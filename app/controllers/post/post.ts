import {Request} from 'express';
import {startSession} from 'mongoose';
import {handleUserNotFound} from '../helpers';
import {IAuthResponse} from '../../middleware/auth';
import {IPost, IComment, ILike} from '../../models/types/post';
import IUser from '../../models/types/user';
import Notification from '../../models/notification';
import Post, {getPost, getPosts, create} from '../../models/post';
const User = require('../../models/user');

export const handleListPosts = async (req: Request, res: IAuthResponse) => {
  const page = req?.query?.page ? Number(req?.query?.page) : 1;
  const limit = req?.query?.limit ? Number(req?.query?.limit) : 20;

  try {
    const posts = await getPosts({}, page, limit);

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

export const handleSearchListPosts = async (
    req: Request, res: IAuthResponse) => {
  const page = req?.query?.page ? Number(req?.query?.page) : 1;
  const limit = req?.query?.limit ? Number(req?.query?.limit) : 20;
  const searchQuery = req.params?.query || '';

  try {
    const posts = await getPosts({
      content: {$regex: '.*' + searchQuery + '.*'},
    }, page, limit);

    return res.status(200).json({
      status: 200,
      data: posts,
      message: 'Listing posts',
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: err?.message || '',
    });
  }
};

export const getSinglePost = async (req: Request, res: IAuthResponse) => {
  try {
    const postId = req?.params?.id;

    const post = await getPost({_id: postId});

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

export const createComment = async (req: Request, res: IAuthResponse) => {
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

    const post = await getPost({_id: postId});
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

    const newPost = await getPost({_id: postId});

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

export const createPost = async (req: Request, res: IAuthResponse) => {
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

    const createdPost = await create(post, session);
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

export const updatePostLike = async (
    req: Request,
    res: IAuthResponse,
) => {
  try {
    const userId = res.userId;
    const postId = req.params.id;

    const post = await getPost({_id: postId});
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

export const updatePost = async (req: Request, res: IAuthResponse) => {
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
    const updatedPost = await Post
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

export const deletePost = async (req: Request, res: IAuthResponse) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const postId = req?.params?.id;

    await Post
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
