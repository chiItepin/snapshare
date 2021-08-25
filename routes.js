const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const authMiddleware = require('./middleware/auth');
const userController = require('./controllers/user');

router.get('/users', authMiddleware, userController.getUsers);
router.post('/users/login', userController.logIn);
router.post('/users/create', userController.create);

module.exports = router;
