const News = require('../models/News');

// @desc    获取所有新闻
// @route   GET /api/news
// @access  Public
exports.getNewsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const startIndex = (page - 1) * limit;
    
    // 查询条件
    let query = {};
    
    // 如果有标签筛选
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // 搜索功能
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // 获取置顶新闻
    const featuredNews = await News.findOne({ isFeatured: true }).sort({ createdAt: -1 });
    
    // 获取普通新闻列表
    const total = await News.countDocuments(query);
    
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // 获取热门文章
    const popularArticles = await News.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title createdAt');
    
    res.status(200).json({
      success: true,
      total,
      data: {
        featuredNews,
        news,
        popularArticles
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取新闻列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取新闻列表'
    });
  }
};

// @desc    获取单个新闻
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: '未找到该新闻'
      });
    }
    
    // 更新浏览次数
    news.viewCount += 1;
    await news.save();
    
    // 获取相关文章 (同标签)
    let relatedArticles = [];
    if (news.tags.length > 0) {
      relatedArticles = await News.find({
        _id: { $ne: news._id },
        tags: { $in: news.tags }
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title summary imageUrl createdAt');
    }
    
    res.status(200).json({
      success: true,
      data: {
        news,
        relatedArticles
      }
    });
  } catch (error) {
    console.error('获取新闻详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，无法获取新闻详情'
    });
  }
}; 