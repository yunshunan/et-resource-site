## 项目结构

```
frontend/
├── public/                    # 静态资源
├── src/                       # 源代码
│   ├── assets/                # 资源文件
│   ├── components/            # 组件
│   │   ├── common/            # 通用组件
│   │   │   ├── LazyImage.vue  # 图片懒加载组件
│   │   │   ├── LazyLoad.vue   # 通用懒加载组件
│   │   │   ├── MemoComponent.vue # 缓存组件
│   │   │   └── VirtualList.vue # 虚拟列表组件
│   │   ├── layout/            # 布局组件
│   │   └── resource/          # 资源相关组件
│   ├── router/                # 路由配置
│   ├── services/              # API服务
│   ├── stores/                # Pinia状态管理
│   │   ├── auth.js            # 用户认证状态
│   │   └── resources.js       # 资源相关状态
│   ├── utils/                 # 工具函数
│   │   ├── errorHandler.js    # 错误处理工具
│   │   └── formValidator.js   # 表单验证工具
│   ├── views/                 # 页面
│   ├── App.vue                # 主组件
│   └── main.js                # 入口文件
├── docs/                      # 文档
│   └── code-quality-improvements.md # 代码质量改进记录
├── tests/                     # 测试文件
├── .eslintrc.js               # ESLint配置
├── vite.config.js             # Vite配置
└── package.json               # 依赖配置