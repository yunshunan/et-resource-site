const Resource = require('../models/Resource');
const logger = require('../config/logger');

// @desc    获取所有资源
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    
    let query = {};
    
    // 筛选分类
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // 搜索关键词
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // 筛选用户上传的资源
    if (req.query.user) {
      query.user = req.query.user;
    }
    
    const total = await Resource.countDocuments(query);
    
    const resources = await Resource.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`获取资源列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取资源列表'
    });
  }
};

// @desc    获取单个资源
// @route   GET /api/resources/:id
// @access  Public
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('user', 'username avatar');
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '未找到该资源'
      });
    }
    
    // 更新浏览次数
    resource.viewCount += 1;
    await resource.save();
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error(`获取资源详情失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取资源详情'
    });
  }
};

// @desc    创建资源
// @route   POST /api/resources
// @access  Private
exports.createResource = async (req, res) => {
  try {
    // 添加当前用户ID
    req.body.user = req.user.id;
    
    const resource = await Resource.create(req.body);
    
    logger.info(`资源创建成功: ${resource.title}`);
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error(`创建资源失败: ${error.message}`);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，资源创建失败'
    });
  }
};

// @desc    更新资源
// @route   PUT /api/resources/:id
// @access  Private
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '未找到该资源'
      });
    }
    
    // 确认用户是资源的拥有者或者是管理员
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权更新此资源'
      });
    }
    
    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    logger.info(`资源更新成功: ${resource.title}`);
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    logger.error(`更新资源失败: ${error.message}`);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误，资源更新失败'
    });
  }
};

// @desc    删除资源
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '未找到该资源'
      });
    }
    
    // 确认用户是资源的拥有者或者是管理员
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权删除此资源'
      });
    }
    
    await resource.deleteOne();
    
    logger.info(`资源删除成功: ${resource.title}`);
    
    res.status(200).json({
      success: true,
      message: '资源已成功删除'
    });
  } catch (error) {
    logger.error(`删除资源失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，资源删除失败'
    });
  }
};

// @desc    收藏/取消收藏资源
// @route   PUT /api/resources/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '未找到该资源'
      });
    }
    
    // 检查用户是否已收藏
    const favoriteIndex = resource.favorites.indexOf(req.user.id);
    let message = '';
    
    if (favoriteIndex === -1) {
      // 添加收藏
      resource.favorites.push(req.user.id);
      message = '资源已收藏';
      logger.info(`用户 ${req.user.id} 收藏了资源: ${resource.title}`);
    } else {
      // 取消收藏
      resource.favorites.splice(favoriteIndex, 1);
      message = '已取消收藏';
      logger.info(`用户 ${req.user.id} 取消收藏资源: ${resource.title}`);
    }
    
    await resource.save();
    
    res.status(200).json({
      success: true,
      message,
      data: {
        favorites: resource.favorites,
        favoriteCount: resource.favorites.length,
        isFavorited: favoriteIndex === -1 // 如果原来没收藏，现在添加了收藏，就为true
      }
    });
  } catch (error) {
    logger.error(`操作收藏失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，收藏操作失败'
    });
  }
};

// @desc    对资源评分
// @route   POST /api/resources/:id/rating
// @access  Private
exports.rateResource = async (req, res) => {
  try {
    const { rating } = req.body;
    
    // 验证评分值
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的评分值 (1-5)'
      });
    }
    
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '未找到该资源'
      });
    }
    
    // 检查用户是否已经评过分
    const ratingIndex = resource.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );
    
    if (ratingIndex >= 0) {
      // 更新已有评分
      resource.ratings[ratingIndex].value = rating;
    } else {
      // 添加新评分
      resource.ratings.push({
        user: req.user.id,
        value: rating
      });
    }
    
    // 重新计算平均评分
    resource.calculateAverageRating();
    
    await resource.save();
    
    logger.info(`用户 ${req.user.id} 对资源 ${resource.title} 评分: ${rating}`);
    
    res.status(200).json({
      success: true,
      data: {
        averageRating: resource.averageRating,
        ratingCount: resource.ratings.length
      }
    });
  } catch (error) {
    logger.error(`评分操作失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，评分操作失败'
    });
  }
};

// @desc    获取用户收藏的资源
// @route   GET /api/resources/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    
    // 查找用户收藏的资源
    const resources = await Resource.find({ favorites: req.user.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Resource.countDocuments({ favorites: req.user.id });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`获取收藏列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取收藏列表'
    });
  }
};

// @desc    获取用户创建的所有资源
// @route   GET /api/resources/user
// @access  Private
exports.getUserResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    
    // 查找用户创建的资源
    const resources = await Resource.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    const total = await Resource.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`获取用户资源列表失败: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取用户资源列表'
    });
  }
}; 