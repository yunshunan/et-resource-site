import app from './app';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 获取端口
const PORT = process.env.PORT || 3030;

// 启动服务器
app.listen(PORT, () => {
  console.log(`
  🚀 服务器已启动!
  🔊 监听端口: ${PORT}
  🌐 环境: ${process.env.NODE_ENV || 'development'}
  📁 API路径: http://localhost:${PORT}/api
  💓 健康检查: http://localhost:${PORT}/api/health
  `);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
}); 