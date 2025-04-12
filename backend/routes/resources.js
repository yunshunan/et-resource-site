const express = require('express');
const { 
  getResources, 
  getResourceById, 
  createResource, 
  updateResource, 
  deleteResource, 
  toggleFavorite, 
  rateResource,
  getFavorites,
  getUserResources
} = require('../controllers/resourceController.js');
const { protect } = require('../middlewares/auth.js');
const { 
  apiLimiter, 
  resourceCreationLimiter, 
  ratingFavoriteLimiter 
} = require('../middleware/rateLimiter.js');
const { 
  checkResourceOwnership,
  checkResourceStatus,
  checkUserRating
} = require('../middleware/resourceOwnership.js');
const { 
  upload, 
  handleMulterError, 
  scanFileForThreats 
} = require('../middleware/fileValidation.js');

const router = express.Router();

// 应用基本API限速
router.use(apiLimiter);

// 公开路由 - 资源列表
router.get('/', getResources);

// 获取资源详情 - 公开路由
router.get('/:id', checkResourceStatus, getResourceById);

// 以下路由都需要登录
// 用户自己的资源
router.get('/user', protect, getUserResources);

// 用户收藏列表
router.get('/user/favorites', protect, getFavorites);

// 创建资源 - 需要登录 + 频率限制 + 文件上传验证
router.post('/', 
  protect, 
  resourceCreationLimiter, 
  upload.single('file'), 
  handleMulterError, 
  scanFileForThreats, 
  createResource
);

// 更新资源 - 需要登录 + 所有权验证 + 状态检查
router.put('/:id', 
  protect, 
  checkResourceOwnership, 
  checkResourceStatus, 
  updateResource
);

// 删除资源 - 需要登录 + 所有权验证
router.delete('/:id', 
  protect, 
  checkResourceOwnership, 
  deleteResource
);

// 收藏/取消收藏 - 需要登录 + 状态检查 + 频率限制
router.put('/:id/favorite', 
  protect, 
  ratingFavoriteLimiter, 
  checkResourceStatus, 
  toggleFavorite
);

// 评分 - 需要登录 + 状态检查 + 评分检查 + 频率限制
router.post('/:id/rating', 
  protect, 
  ratingFavoriteLimiter, 
  checkResourceStatus, 
  checkUserRating, 
  rateResource
);

module.exports = router; 