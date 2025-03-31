const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn(`注册失败: 用户名或邮箱 ${email} 已被注册`);
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 生成Token并返回
    sendTokenResponse(user, 201, res);
    logger.info(`用户注册成功: ${email}`);
  } catch (error) {
    logger.error(`用户注册失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法完成注册'
    });
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证邮箱和密码是否提供
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    // 查找用户并包含密码字段
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn(`登录失败: 邮箱 ${email} 不存在`);
      return res.status(401).json({
        success: false,
        message: '无效的登录凭证'
      });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn(`登录失败: 邮箱 ${email} 密码错误`);
      return res.status(401).json({
        success: false,
        message: '无效的登录凭证'
      });
    }

    // 生成Token并返回
    sendTokenResponse(user, 200, res);
    logger.info(`用户登录成功: ${email}`);
  } catch (error) {
    logger.error(`用户登录失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法完成登录'
    });
  }
};

// @desc    获取当前登录用户
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`获取用户信息失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取用户信息'
    });
  }
};

// @desc    刷新Token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '请提供刷新令牌'
      });
    }

    // 验证刷新令牌
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'et-resource-site-refresh-secret-key'
    );

    // 查找用户
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: '无效的刷新令牌'
      });
    }

    // 生成新的访问令牌
    const accessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    logger.error(`刷新令牌失败: ${error.message}`);
    res.status(401).json({
      success: false,
      message: '无效的刷新令牌，请重新登录'
    });
  }
};

// @desc    用户注销
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // 清除cookie中的token
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    // 如果使用刷新令牌，则也应清除刷新令牌
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: '注销成功'
    });
  } catch (error) {
    logger.error(`用户注销失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法完成注销'
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // 生成访问令牌
  const accessToken = user.getSignedJwtToken();
  
  // 生成刷新令牌
  const refreshToken = user.getRefreshToken();
  
  // 保存刷新令牌到数据库
  user.save({ validateBeforeSave: false });

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天
    ),
    httpOnly: true
  };

  // 在生产环境中使用安全cookie
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', accessToken, options)
    .json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
}; 