const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由 - 验证用户是否已登录
exports.protect = async (req, res, next) => {
  let token;
  
  // 从请求头或cookie中获取token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从Bearer token中提取
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 从cookie中获取
    token = req.cookies.token;
  }

  // 检查token是否存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授权访问，请先登录'
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'et-resource-site-secret-key');

    // 获取用户信息
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '找不到该用户'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('Token验证失败:', error.message);
    return res.status(401).json({
      success: false,
      message: '未授权访问，请重新登录'
    });
  }
};

// 基于角色的权限控制
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请先登录'
      });
    }

    // 检查用户角色是否被允许
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }

    next();
  };
}; 