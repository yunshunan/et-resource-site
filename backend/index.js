const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/et-resource-site');
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    process.exit(1);
  }
};

// 路由
const homeRoutes = require('./routes/home');
const resourceRoutes = require('./routes/resources');
const newsRoutes = require('./routes/news');

app.use('/api/home', homeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/news', newsRoutes);

// 首页测试路由
app.get('/', (req, res) => {
  res.send('Et 资源小站 API 服务运行中');
});

// 处理未找到的路由
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 