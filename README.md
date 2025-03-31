# Et 资源小站

Et 资源小站是一个提供各类优质资源的平台，包括办公资源、设计资源、营销资源等。

## 项目架构

项目采用前后端分离的架构:

- 前端: Vue.js 3
- 后端: Node.js + Express
- 数据库: MongoDB

## 功能特点

- 资源分类浏览与搜索
- 新闻资讯阅读
- 响应式布局，支持移动设备
- RESTful API 接口

## 目录结构

```
et-resource-site/
├── frontend/               # 前端项目目录
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── assets/         # 资源文件
│   │   ├── components/     # 组件
│   │   ├── router/         # 路由
│   │   ├── services/       # API服务
│   │   ├── views/          # 页面
│   │   ├── App.vue         # 主组件
│   │   └── main.js         # 入口文件
│   └── package.json        # 依赖配置
│
├── backend/                # 后端项目目录
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── middlewares/        # 中间件
│   ├── index.js            # 入口文件
│   └── package.json        # 依赖配置
│
└── README.md               # 项目说明
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run serve
```

### 后端

```bash
cd backend
npm install
# 根据.env.example创建.env文件并配置
cp .env.example .env
npm run dev
```

## API 文档

### 首页数据

- GET `/api/home` - 获取首页数据，包括轮播图、热门资源和最新资讯

### 资源

- GET `/api/resources` - 获取资源列表，支持分页和分类筛选
- GET `/api/resources/:id` - 获取单个资源详情

### 新闻

- GET `/api/news` - 获取新闻列表，支持分页
- GET `/api/news/:id` - 获取单个新闻详情

## 部署

项目部署在阿里云服务器，通过域名 `zyxz123.com` 访问。

## 开发计划

- [ ] 用户注册与登录
- [ ] 资源评分与评论
- [ ] 后台管理系统
- [ ] 站内通信

## 贡献

欢迎提交Pull Request或提出Issues。

## 许可证

[MIT](LICENSE) 