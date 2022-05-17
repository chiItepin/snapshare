// eslint-disable-next-line new-cap
import {Router} from 'express';
import {
  listNotifications,
  updateNotificationsSeenStatus,
  listUnSeenNotifications,
} from './app/controllers/user/notification';
import {
  handleListPosts,
  getSinglePost,
  createPost,
  updatePost,
  updatePostLike,
  deletePost,
  createComment,
  handleSearchListPosts,
} from './app/controllers/post/post';
const authMiddleware = require('./app/middleware/auth');
const userController = require('./app/controllers/user/user');
const followingController = require('./app/controllers/user/following');

// eslint-disable-next-line new-cap
const router = Router();

// Users
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:id/posts', userController.getUserPosts);
router.get('/users/:id', userController.getUser);
router.patch('/users/:id', authMiddleware, userController.updateUserImage);
router.post('/users/login', userController.logIn);
router.post('/users/create', userController.create);

// Posts
router.get('/posts', authMiddleware, handleListPosts);
router.get('/posts/:id', getSinglePost);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);
router.patch('/posts/:id/like', authMiddleware, updatePostLike);
router.delete('/posts/:id', authMiddleware, deletePost);
router.get('/posts/search/:query', authMiddleware, handleSearchListPosts);

// Comments
router.post('/posts/:id/comments',
    authMiddleware,
    createComment);

// Followers
router.post('/followers', authMiddleware, followingController.createFollower);
router.get('/followers/:id', followingController.listFollowers);

// Notifications
router.get('/notifications',
    authMiddleware, listNotifications);
router.get('/notifications/unseen',
    authMiddleware, listUnSeenNotifications);
router.patch('/notifications/status',
    authMiddleware, updateNotificationsSeenStatus);

module.exports = router;
