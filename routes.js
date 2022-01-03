const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const authMiddleware = require('./middleware/auth');
const userController = require('./controllers/user');
const postController = require('./controllers/post');

// Users
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/:id', authMiddleware, userController.getUser);
router.patch('/users/:id', authMiddleware, userController.updateUserImage);
router.post('/users/login', userController.logIn);
router.post('/users/create', userController.create);

// Posts
router.get('/posts', authMiddleware, postController.getPosts);
router.post('/posts', authMiddleware, postController.createPost);
router.put('/posts/:id', authMiddleware, postController.updatePost);
router.patch('/posts/:id/like', authMiddleware, postController.updatePostLike);
router.delete('/posts/:id', authMiddleware, postController.deletePost);

// Comments
router.post('/posts/:id/comments',
    authMiddleware,
    postController.createComment);

module.exports = router;
