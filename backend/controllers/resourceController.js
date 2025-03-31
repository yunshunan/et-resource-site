const Resource = require('../models/Resource');

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
    
    const total = await Resource.countDocuments(query);
    
    const resources = await Resource.find(query)
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
    console.error('获取资源列表失败:', error);
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
    const resource = await Resource.findById(req.params.id);
    
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
    console.error('获取资源详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取资源详情'
    });
  }
}; 