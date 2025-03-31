import { rest } from 'msw';

// 模拟资源数据
const mockResources = [
  {
    _id: 'res1',
    title: '前端开发最佳实践',
    description: '包含Vue、React等框架的最佳实践指南',
    content: '这是详细内容...',
    category: 'frontend',
    tags: ['vue', 'react', 'best-practices'],
    user: {
      _id: 'user1',
      username: 'testuser'
    },
    favorites: ['user1'],
    favoriteCount: 1,
    averageRating: 4.5,
    ratingCount: 2,
    ratings: [
      { user: 'user1', value: 5 },
      { user: 'user2', value: 4 }
    ],
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    _id: 'res2',
    title: 'Node.js后端开发指南',
    description: 'Node.js和Express框架的完整教程',
    content: '这是详细内容...',
    category: 'backend',
    tags: ['nodejs', 'express', 'backend'],
    user: {
      _id: 'user2',
      username: 'otheruser'
    },
    favorites: [],
    favoriteCount: 0,
    averageRating: 0,
    ratingCount: 0,
    ratings: [],
    createdAt: '2023-01-02T00:00:00Z'
  }
];

// 模拟分页数据
const mockPagination = {
  currentPage: 1,
  totalPages: 1,
  total: 2
};

// 资源处理程序
const resourceHandlers = [
  // 获取资源列表
  rest.get('/api/api/resources', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockResources,
        pagination: mockPagination
      })
    );
  }),
  
  // 获取资源详情
  rest.get('/api/api/resources/:id', (req, res, ctx) => {
    const { id } = req.params;
    const resource = mockResources.find(r => r._id === id);
    
    if (resource) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: resource
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: '资源不存在'
      })
    );
  }),
  
  // 创建资源
  rest.post('/api/api/resources', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: '资源创建成功',
        data: {
          _id: 'new-resource-id',
          ...req.body,
          user: { _id: 'user1', username: 'testuser' },
          favorites: [],
          favoriteCount: 0,
          averageRating: 0,
          ratingCount: 0,
          createdAt: new Date().toISOString()
        }
      })
    );
  }),
  
  // 更新资源
  rest.put('/api/api/resources/:id', (req, res, ctx) => {
    const { id } = req.params;
    const resourceIndex = mockResources.findIndex(r => r._id === id);
    
    if (resourceIndex !== -1) {
      const updatedResource = {
        ...mockResources[resourceIndex],
        ...req.body
      };
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: '资源更新成功',
          data: updatedResource
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: '资源不存在'
      })
    );
  }),
  
  // 删除资源
  rest.delete('/api/api/resources/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: '资源删除成功'
      })
    );
  }),
  
  // 收藏/取消收藏
  rest.put('/api/api/resources/:id/favorite', (req, res, ctx) => {
    const { id } = req.params;
    const resource = mockResources.find(r => r._id === id);
    
    if (resource) {
      const userId = 'user1';
      const isFavorited = resource.favorites.includes(userId);
      
      let updatedFavorites;
      if (isFavorited) {
        // 取消收藏
        updatedFavorites = resource.favorites.filter(id => id !== userId);
      } else {
        // 添加收藏
        updatedFavorites = [...resource.favorites, userId];
      }
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: isFavorited ? '已取消收藏' : '已添加收藏',
          data: {
            favorites: updatedFavorites,
            favoriteCount: updatedFavorites.length,
            isFavorited: !isFavorited
          }
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: '资源不存在'
      })
    );
  }),
  
  // 评分
  rest.post('/api/api/resources/:id/rating', (req, res, ctx) => {
    const { id } = req.params;
    const { rating } = req.body || {};
    const resource = mockResources.find(r => r._id === id);
    
    if (resource) {
      const userId = 'user1';
      const ratingIndex = resource.ratings.findIndex(r => r.user === userId);
      
      let updatedRatings = [...resource.ratings];
      if (ratingIndex !== -1) {
        // 更新评分
        updatedRatings[ratingIndex] = { ...updatedRatings[ratingIndex], value: rating };
      } else {
        // 添加评分
        updatedRatings.push({ user: userId, value: rating });
      }
      
      // 计算平均评分
      const totalRating = updatedRatings.reduce((sum, r) => sum + r.value, 0);
      const averageRating = updatedRatings.length > 0 ? totalRating / updatedRatings.length : 0;
      
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: '评分成功',
          data: {
            averageRating: parseFloat(averageRating.toFixed(1)),
            ratingCount: updatedRatings.length
          }
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: '资源不存在'
      })
    );
  }),
  
  // 获取用户收藏列表
  rest.get('/api/api/resources/user/favorites', (req, res, ctx) => {
    const favoriteResources = mockResources.filter(r => r.favorites.includes('user1'));
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: favoriteResources,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: favoriteResources.length
        }
      })
    );
  })
];

export default resourceHandlers; 