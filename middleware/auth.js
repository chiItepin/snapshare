const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const email = decodedToken.email;
    const id = decodedToken.id;
    if (!email || !id) {
      res.status(401).json({
        message: 'Please, login to proceed!',
      });
    } else {
      res.userEmail = email;
      res.userId = id;
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: 'Please, login to proceed!',
    });
  }
};
