const Banner = require('../models/Banner');
const Resource = require('../models/Resource');
const News = require('../models/News');

// @desc    获取首页数据
// @route   GET /api/home
// @access  Public
exports.getHomeData = async (req, res) => {
  try {
    // 获取轮播图
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    
    // 获取热门资源
    const featuredResources = await Resource.find()
      .sort({ viewCount: -1 })
      .limit(3);
    
    // 获取最新新闻
    const latestNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(4);
    
    res.status(200).json({
      success: true,
      data: {
        banners,
        featuredResources,
        latestNews
      }
    });
  } catch (error) {
    console.error('获取首页数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取首页数据'
    });
  }
}; 