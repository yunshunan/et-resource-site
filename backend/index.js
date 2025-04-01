const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const path = require('path');
const fs = require('fs');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 添加HTTP请求日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // 创建HTTP请求日志流
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// MongoDB连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/et-resource-site');
    logger.info('MongoDB连接成功');
  } catch (error) {
    logger.error(`MongoDB连接失败: ${error.message}`);
    process.exit(1);
  }
};

// 路由
const homeRoutes = require('./routes/home');
const resourceRoutes = require('./routes/resources');
const newsRoutes = require('./routes/news');
const authRoutes = require('./routes/auth');

app.use('/api/home', homeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);

// 首页测试路由
app.get('/', (req, res) => {
  res.send('Et 资源小站 API 服务运行中');
});

// 处理未找到的路由
app.use((req, res) => {
  logger.warn(`尝试访问不存在的路径: ${req.originalUrl}`);
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`服务器错误: ${err.stack}`);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  logger.info(`服务器运行在 http://localhost:${PORT}`);
}); 