// Mock Data for Development
// This file contains mock data for development and testing

// Helper function to generate IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to get current date
const currentDate = () => new Date().toISOString();

// Storage for mock data
const storage = {
  users: [
    {
      id: 'user1',
      username: 'admin',
      email: 'admin@example.com',
      displayName: '管理员',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 'user2',
      username: 'user',
      email: 'user@example.com',
      displayName: '普通用户',
      role: 'user',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  ],
  resources: [
    {
      id: 'resource1',
      title: '前端开发最佳实践指南',
      description: '这是一份全面的前端开发指南，包含HTML、CSS和JavaScript的最佳实践。',
      type: 'document',
      category: '开发资源',
      downloadUrl: '/assets/samples/frontend-guide.pdf',
      cover: 'https://via.placeholder.com/400x300/3498db/ffffff?text=前端开发指南',
      price: 0, // 免费资源
      tags: ['前端', 'HTML', 'CSS', 'JavaScript'],
      author: 'user1',
      downloads: 1250,
      views: 5230,
      rating: 4.8,
      createdAt: '2023-02-01T00:00:00.000Z',
      updatedAt: '2023-03-15T00:00:00.000Z'
    },
    {
      id: 'resource2',
      title: 'Vue.js 项目模板',
      description: '一个包含Vuex、Vue Router和测试配置的完整Vue.js项目模板。',
      type: 'template',
      category: '开发资源',
      downloadUrl: '/assets/samples/vue-template.zip',
      cover: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Vue项目模板',
      price: 19.99,
      tags: ['Vue', '模板', '前端框架'],
      author: 'user1',
      downloads: 873,
      views: 3120,
      rating: 4.6,
      createdAt: '2023-02-15T00:00:00.000Z',
      updatedAt: '2023-03-10T00:00:00.000Z'
    },
    {
      id: 'resource3',
      title: 'React 组件库',
      description: '一套精美的React UI组件库，包含多种常用组件。',
      type: 'library',
      category: '开发资源',
      downloadUrl: '/assets/samples/react-components.zip',
      cover: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=React组件库',
      price: 29.99,
      tags: ['React', '组件', 'UI库'],
      author: 'user2',
      downloads: 1560,
      views: 4780,
      rating: 4.9,
      createdAt: '2023-01-20T00:00:00.000Z',
      updatedAt: '2023-03-20T00:00:00.000Z'
    },
    {
      id: 'resource4',
      title: '商业计划书模板',
      description: '专业的商业计划书模板，包括市场分析、财务预测等章节。',
      type: 'template',
      category: '办公资源',
      downloadUrl: '/assets/samples/business-plan.docx',
      cover: 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=商业计划书',
      price: 15.99,
      tags: ['商业', '计划书', '办公'],
      author: 'user1',
      downloads: 562,
      views: 1890,
      rating: 4.5,
      createdAt: '2023-03-05T00:00:00.000Z',
      updatedAt: '2023-03-20T00:00:00.000Z'
    },
    {
      id: 'resource5',
      title: '现代简约PPT模板',
      description: '简洁大方的PPT模板，适合各类商业演示和报告。',
      type: 'template',
      category: '办公资源',
      downloadUrl: '/assets/samples/minimalist-ppt.pptx',
      cover: 'https://via.placeholder.com/400x300/34495e/ffffff?text=PPT模板',
      price: 9.99,
      tags: ['PPT', '演示', '简约'],
      author: 'user2',
      downloads: 1350,
      views: 3850,
      rating: 4.7,
      createdAt: '2023-02-28T00:00:00.000Z',
      updatedAt: '2023-03-18T00:00:00.000Z'
    },
    {
      id: 'resource6',
      title: '社交媒体营销指南',
      description: '详细介绍如何利用各大社交媒体平台进行有效的营销活动。',
      type: 'document',
      category: '营销资源',
      downloadUrl: '/assets/samples/social-media-guide.pdf',
      cover: 'https://via.placeholder.com/400x300/f39c12/ffffff?text=社交媒体营销',
      price: 25.99,
      tags: ['营销', '社交媒体', '指南'],
      author: 'user1',
      downloads: 925,
      views: 2760,
      rating: 4.8,
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2023-03-10T00:00:00.000Z'
    },
    {
      id: 'resource7',
      title: 'Instagram故事模板',
      description: '一套时尚的Instagram故事模板，适合品牌宣传和产品展示。',
      type: 'template',
      category: '设计资源',
      downloadUrl: '/assets/samples/instagram-templates.zip',
      cover: 'https://via.placeholder.com/400x300/1abc9c/ffffff?text=IG模板',
      price: 12.99,
      tags: ['Instagram', '设计', '社交媒体'],
      author: 'user2',
      downloads: 1580,
      views: 4120,
      rating: 4.9,
      createdAt: '2023-02-10T00:00:00.000Z',
      updatedAt: '2023-03-22T00:00:00.000Z'
    },
    {
      id: 'resource8',
      title: '教育课程规划表',
      description: '帮助教师规划课程的专业模板，适用于各级教育。',
      type: 'template',
      category: '教育资源',
      downloadUrl: '/assets/samples/course-planner.xlsx',
      cover: 'https://via.placeholder.com/400x300/3498db/ffffff?text=课程规划',
      price: 5.99,
      tags: ['教育', '课程', '规划'],
      author: 'user1',
      downloads: 420,
      views: 1250,
      rating: 4.6,
      createdAt: '2023-03-01T00:00:00.000Z',
      updatedAt: '2023-03-25T00:00:00.000Z'
    },
    {
      id: 'resource9',
      title: 'Adobe Photoshop动作合集',
      description: '提高工作效率的Photoshop动作集，一键实现复杂效果。',
      type: 'plugin',
      category: '设计资源',
      downloadUrl: '/assets/samples/photoshop-actions.zip',
      cover: 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=PS动作',
      price: 18.99,
      tags: ['设计', 'Photoshop', '插件'],
      author: 'user2',
      downloads: 1840,
      views: 5320,
      rating: 4.7,
      createdAt: '2023-01-25T00:00:00.000Z',
      updatedAt: '2023-03-15T00:00:00.000Z'
    },
    {
      id: 'resource10',
      title: 'Django REST框架教程',
      description: '从入门到精通的Django REST框架教程，包含实战项目案例。',
      type: 'document',
      category: '开发资源',
      downloadUrl: '/assets/samples/django-rest-tutorial.pdf',
      cover: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Django教程',
      price: 0,
      tags: ['Python', 'Django', 'API', '后端'],
      author: 'user1',
      downloads: 960,
      views: 2850,
      rating: 4.8,
      createdAt: '2023-02-18T00:00:00.000Z',
      updatedAt: '2023-03-28T00:00:00.000Z'
    }
  ],
  news: [
    {
      id: 'news1',
      title: 'Et资源小站正式上线',
      content: '<p>我们很高兴地宣布，Et资源小站已经正式上线！本站致力于为开发者提供高质量的资源和学习材料。</p><p>在这里，您可以找到各种前端和后端开发资源，包括模板、组件库、教程等。我们将不断更新和完善网站内容，为您提供更好的服务。</p>',
      cover: '/assets/images/news/launch.jpg',
      author: 'user1',
      tags: ['公告', '网站更新'],
      isPublished: true,
      isFeature: true,
      views: 1256,
      comments: 42,
      createdAt: '2023-04-01T00:00:00.000Z',
      updatedAt: '2023-04-01T00:00:00.000Z'
    },
    {
      id: 'news2',
      title: 'Vue 3.3版本发布，带来哪些新特性？',
      content: '<p>Vue.js团队近日发布了3.3版本，代号"Rurouni Kenshin"。这个版本带来了多项改进和新特性：</p><ul><li>改进的类型推断系统</li><li>新的defineModel宏</li><li>更好的开发者体验</li><li>性能优化</li></ul><p>对于Vue开发者来说，这次更新值得关注和升级。</p>',
      cover: '/assets/images/news/vue-update.jpg',
      author: 'user2',
      tags: ['Vue', '技术资讯'],
      isPublished: true,
      isFeature: true,
      views: 875,
      comments: 23,
      createdAt: '2023-05-15T00:00:00.000Z',
      updatedAt: '2023-05-15T00:00:00.000Z'
    },
    {
      id: 'news3',
      title: '前端工程化实践指南发布',
      content: '<p>我们发布了一份详尽的《前端工程化实践指南》，涵盖了现代前端开发的工程化实践。</p><p>内容包括：</p><ul><li>构建工具选择与配置</li><li>代码规范与质量控制</li><li>CI/CD流程设计</li><li>性能优化策略</li></ul><p>无论你是前端新手还是有经验的开发者，这份指南都能给你带来帮助。</p>',
      cover: '/assets/images/news/engineering.jpg',
      author: 'user1',
      tags: ['前端', '工程化', '最佳实践'],
      isPublished: true,
      isFeature: false,
      views: 634,
      comments: 15,
      createdAt: '2023-06-10T00:00:00.000Z',
      updatedAt: '2023-06-10T00:00:00.000Z'
    }
  ],
  comments: [
    {
      id: 'comment1',
      content: '非常有用的资源，谢谢分享！',
      author: 'user2',
      resourceId: 'resource1',
      createdAt: '2023-03-01T00:00:00.000Z'
    },
    {
      id: 'comment2',
      content: '这个模板为我节省了很多时间，值得购买。',
      author: 'user2',
      resourceId: 'resource2',
      createdAt: '2023-03-20T00:00:00.000Z'
    }
  ],
  categories: [
    { id: 'cat1', name: '开发资源', count: 3 },
    { id: 'cat2', name: '设计资源', count: 2 },
    { id: 'cat3', name: '办公资源', count: 2 },
    { id: 'cat4', name: '营销资源', count: 1 },
    { id: 'cat5', name: '教育资源', count: 1 }
  ]
};

// Mock handlers for each resource type
const mockData = {
  // Users
  users: {
    list: ({ params }) => {
      let result = [...storage.users];
      
      // Apply filters if provided
      if (params) {
        if (params.role) {
          result = result.filter(user => user.role === params.role);
        }
        // Add more filters as needed
      }
      
      return result;
    },
    
    get: ({ id }) => {
      const user = storage.users.find(u => u.id === id);
      if (!user) throw new Error(`User with ID ${id} not found`);
      return user;
    },
    
    create: ({ data }) => {
      const newUser = {
        id: generateId(),
        ...data,
        createdAt: currentDate(),
        updatedAt: currentDate()
      };
      
      storage.users.push(newUser);
      return newUser;
    },
    
    update: ({ id, data }) => {
      const index = storage.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error(`User with ID ${id} not found`);
      
      const updatedUser = {
        ...storage.users[index],
        ...data,
        updatedAt: currentDate()
      };
      
      storage.users[index] = updatedUser;
      return updatedUser;
    },
    
    delete: ({ id }) => {
      const index = storage.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error(`User with ID ${id} not found`);
      
      const deletedUser = storage.users[index];
      storage.users.splice(index, 1);
      
      return { success: true, id };
    }
  },
  
  // Resources
  resources: {
    list: ({ params }) => {
      let result = [...storage.resources];
      
      // Apply filters if provided
      if (params) {
        if (params.type) {
          result = result.filter(resource => resource.type === params.type);
        }
        
        if (params.category) {
          result = result.filter(resource => resource.category === params.category);
        }
        
        if (params.author) {
          result = result.filter(resource => resource.author === params.author);
        }
        
        if (params.tags && params.tags.length) {
          result = result.filter(resource => 
            params.tags.some(tag => resource.tags.includes(tag))
          );
        }
        
        if (params.search) {
          const searchQuery = params.search.toLowerCase();
          result = result.filter(resource => 
            resource.title.toLowerCase().includes(searchQuery) || 
            resource.description.toLowerCase().includes(searchQuery)
          );
        }
      }
      
      return result;
    },
    
    get: ({ id }) => {
      const resource = storage.resources.find(r => r.id === id);
      if (!resource) throw new Error(`Resource with ID ${id} not found`);
      
      // Increment views count
      resource.views += 1;
      
      return resource;
    },
    
    create: ({ data }) => {
      const newResource = {
        id: generateId(),
        ...data,
        downloads: 0,
        views: 0,
        rating: 0,
        createdAt: currentDate(),
        updatedAt: currentDate()
      };
      
      storage.resources.push(newResource);
      return newResource;
    },
    
    update: ({ id, data }) => {
      const index = storage.resources.findIndex(r => r.id === id);
      if (index === -1) throw new Error(`Resource with ID ${id} not found`);
      
      const updatedResource = {
        ...storage.resources[index],
        ...data,
        updatedAt: currentDate()
      };
      
      storage.resources[index] = updatedResource;
      return updatedResource;
    },
    
    delete: ({ id }) => {
      const index = storage.resources.findIndex(r => r.id === id);
      if (index === -1) throw new Error(`Resource with ID ${id} not found`);
      
      storage.resources.splice(index, 1);
      
      return { success: true, id };
    }
  },
  
  // Categories
  categories: {
    list: () => {
      return storage.categories;
    }
  },
  
  // News
  news: {
    list: ({ params }) => {
      let result = [...storage.news];
      
      // Apply filters if provided
      if (params) {
        if (params.tags && params.tags.length) {
          result = result.filter(newsItem => 
            params.tags.some(tag => newsItem.tags.includes(tag))
          );
        }
        
        if (params.isFeature !== undefined) {
          result = result.filter(newsItem => newsItem.isFeature === params.isFeature);
        }
        
        if (params.author) {
          result = result.filter(newsItem => newsItem.author === params.author);
        }
        
        // Add more filters as needed
      }
      
      return result;
    },
    
    get: ({ id }) => {
      const newsItem = storage.news.find(n => n.id === id);
      if (!newsItem) throw new Error(`News item with ID ${id} not found`);
      
      // Increment views count
      newsItem.views += 1;
      
      return newsItem;
    },
    
    create: ({ data }) => {
      const newNewsItem = {
        id: generateId(),
        ...data,
        views: 0,
        comments: 0,
        createdAt: currentDate(),
        updatedAt: currentDate()
      };
      
      storage.news.push(newNewsItem);
      return newNewsItem;
    },
    
    update: ({ id, data }) => {
      const index = storage.news.findIndex(n => n.id === id);
      if (index === -1) throw new Error(`News item with ID ${id} not found`);
      
      const updatedNewsItem = {
        ...storage.news[index],
        ...data,
        updatedAt: currentDate()
      };
      
      storage.news[index] = updatedNewsItem;
      return updatedNewsItem;
    },
    
    delete: ({ id }) => {
      const index = storage.news.findIndex(n => n.id === id);
      if (index === -1) throw new Error(`News item with ID ${id} not found`);
      
      storage.news.splice(index, 1);
      
      return { success: true, id };
    }
  },
  
  // Comments
  comments: {
    list: ({ params }) => {
      let result = [...storage.comments];
      
      // Apply filters if provided
      if (params) {
        if (params.resourceId) {
          result = result.filter(comment => comment.resourceId === params.resourceId);
        }
        
        if (params.author) {
          result = result.filter(comment => comment.author === params.author);
        }
        
        // Add more filters as needed
      }
      
      return result;
    },
    
    get: ({ id }) => {
      const comment = storage.comments.find(c => c.id === id);
      if (!comment) throw new Error(`Comment with ID ${id} not found`);
      return comment;
    },
    
    create: ({ data }) => {
      const newComment = {
        id: generateId(),
        ...data,
        createdAt: currentDate()
      };
      
      storage.comments.push(newComment);
      
      // Increment comment count for the associated resource
      if (data.resourceId) {
        const resource = storage.resources.find(r => r.id === data.resourceId);
        if (resource) {
          resource.comments = (resource.comments || 0) + 1;
        }
      }
      
      return newComment;
    },
    
    update: ({ id, data }) => {
      const index = storage.comments.findIndex(c => c.id === id);
      if (index === -1) throw new Error(`Comment with ID ${id} not found`);
      
      const updatedComment = {
        ...storage.comments[index],
        ...data
      };
      
      storage.comments[index] = updatedComment;
      return updatedComment;
    },
    
    delete: ({ id }) => {
      const index = storage.comments.findIndex(c => c.id === id);
      if (index === -1) throw new Error(`Comment with ID ${id} not found`);
      
      const comment = storage.comments[index];
      storage.comments.splice(index, 1);
      
      // Decrement comment count for the associated resource
      if (comment.resourceId) {
        const resource = storage.resources.find(r => r.id === comment.resourceId);
        if (resource && resource.comments > 0) {
          resource.comments -= 1;
        }
      }
      
      return { success: true, id };
    }
  }
};

export default mockData; 