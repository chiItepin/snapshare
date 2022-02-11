// eslint-disable-next-line new-cap
import {Router} from 'express';
import {
  listNotifications,
  updateNotificationsSeenStatus,
  listUnSeenNotifications,
} from './app/controllers/user/notification';
const authMiddleware = require('./app/middleware/auth');
const userController = require('./app/controllers/user/user');
const postController = require('./app/controllers/post/post');
const followingController = require('./app/controllers/user/following');

// eslint-disable-next-line new-cap
const router = Router();

// Users
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:id/posts', authMiddleware, userController.getUserPosts);
router.get('/users/:id', authMiddleware, userController.getUser);
router.patch('/users/:id', authMiddleware, userController.updateUserImage);
router.post('/users/login', userController.logIn);
router.post('/users/create', userController.create);

// Posts
router.get('/posts', authMiddleware, postController.getPosts);
router.get('/posts/:id', authMiddleware, postController.getSinglePost);
router.post('/posts', authMiddleware, postController.createPost);
router.put('/posts/:id', authMiddleware, postController.updatePost);
router.patch('/posts/:id/like', authMiddleware, postController.updatePostLike);
router.delete('/posts/:id', authMiddleware, postController.deletePost);

// Comments
router.post('/posts/:id/comments',
    authMiddleware,
    postController.createComment);

// Followers
router.post('/followers', authMiddleware, followingController.createFollower);
router.get('/followers/:id', authMiddleware, followingController.listFollowers);

// Notifications
router.get('/notifications',
    authMiddleware, listNotifications);
router.get('/notifications/unseen',
    authMiddleware, listUnSeenNotifications);
router.patch('/notifications/status',
    authMiddleware, updateNotificationsSeenStatus);

module.exports = router;
