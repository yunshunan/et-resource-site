const Resource = require('../models/Resource');

/**
 * 检查当前用户是否是资源的拥有者
 * 如果不是拥有者，返回403错误
 */
const checkResourceOwnership = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: '缺少资源ID'
      });
    }
    
    // 查找资源
    const resource = await Resource.findById(resourceId);
    
    // 资源不存在
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '资源不存在'
      });
    }
    
    // 检查资源是否属于当前用户
    if (resource.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '没有权限执行此操作'
      });
    }
    
    // 将资源对象添加到请求中，以便后续中间件使用
    req.resource = resource;
    next();
  } catch (error) {
    console.error('检查资源所有权失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

/**
 * 检查资源状态是否为活跃
 * 这对于防止操作已被禁用的资源很有用
 */
const checkResourceStatus = async (req, res, next) => {
  try {
    // 如果前面已经查询过资源并添加到req中，则不需要再次查询
    const resource = req.resource || await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '资源不存在'
      });
    }
    
    // 检查资源状态
    if (resource.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '此资源已被禁用或被举报'
      });
    }
    
    // 将资源对象添加到请求中，以便后续中间件使用
    if (!req.resource) req.resource = resource;
    next();
  } catch (error) {
    console.error('检查资源状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

/**
 * 检查用户是否已经评分
 * 防止重复评分
 */
const checkUserRating = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    // 查找资源
    const resource = req.resource || await Resource.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '资源不存在'
      });
    }
    
    // 检查用户是否已经评分
    const existingRating = resource.ratings.find(
      rating => rating.user.toString() === userId
    );
    
    // 如果已有评分，则更新
    if (existingRating) {
      req.existingRating = existingRating;
    }
    
    // 将资源对象添加到请求中，以便后续中间件使用
    if (!req.resource) req.resource = resource;
    next();
  } catch (error) {
    console.error('检查用户评分失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  checkResourceOwnership,
  checkResourceStatus,
  checkUserRating
}; 