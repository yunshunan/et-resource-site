import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initLeanCloud } from './libs/leancloud'; // 导入初始化函数

// 加载环境变量
dotenv.config();

async function startServer() {
  try {
    // 显式初始化 LeanCloud
    initLeanCloud(); 

    let mongoUri = process.env.MONGO_URI;

    // 在开发环境使用内存数据库
    if (process.env.NODE_ENV === 'development') {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('💾 使用MongoDB内存服务器进行开发');
    }

    if (!mongoUri) {
      console.error('错误: MONGO_URI 环境变量未设置。');
      process.exit(1);
    }

    // 连接 MongoDB 数据库
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 连接成功');

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
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
}); 