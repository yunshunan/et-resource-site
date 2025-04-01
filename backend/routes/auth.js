const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  refreshToken, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// 公共路由
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// 需要认证的路由
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router; 