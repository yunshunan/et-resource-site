const rateLimit = require('express-rate-limit');

// 创建基本限速器
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,  // 时间窗口
    max,       // 窗口内请求数量限制
    message: {
      success: false,
      message: message || '请求过于频繁，请稍后再试'
    },
    standardHeaders: true, // 返回 RateLimit-* 标准头信息
    legacyHeaders: false,  // 禁用 X-RateLimit-* 头信息
  });
};

// 一般API限速 - 每分钟60次请求
const apiLimiter = createLimiter(
  60 * 1000,
  60,
  '请求过于频繁，请稍后再试'
);

// 登录注册限速 - 每10分钟10次请求
const authLimiter = createLimiter(
  10 * 60 * 1000,
  10,
  '尝试登录次数过多，请10分钟后再试'
);

// 资源创建限速 - 每小时10次请求
const resourceCreationLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  '创建资源过于频繁，每小时最多创建10个资源'
);

// 评分收藏限速 - 每分钟20次请求
const ratingFavoriteLimiter = createLimiter(
  60 * 1000,
  20,
  '操作过于频繁，请稍后再试'
);

module.exports = {
  apiLimiter,
  authLimiter,
  resourceCreationLimiter,
  ratingFavoriteLimiter
}; 