import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AV } from './libs/leancloud';
// import firebase from './libs/firebase';

// 加载环境变量
dotenv.config();

// 在非生产环境下，如果没有MongoDB URI，默认使用内存服务器
const useMongoMemory = !process.env.MONGO_URI && process.env.NODE_ENV !== 'production';

const startServer = async () => {
  // 捕获未处理的异常和拒绝
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    // 在开发模式下立即崩溃，便于排查问题
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason) => {
    console.error('未处理的Promise拒绝:', reason);
  });

  let uri = process.env.MONGO_URI;
  let mongod: MongoMemoryServer | undefined;

  try {
    // 如果需要，启动MongoDB内存服务器
    if (useMongoMemory) {
      console.log('💾 使用MongoDB内存服务器进行开发');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    // 连接到MongoDB
    if (!uri) {
      throw new Error('MongoDB URI未设置');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB 连接成功');

    // 获取端口
    const PORT = process.env.PORT || 3032;

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
      🚀 服务器已启动!
      🔊 监听端口: ${PORT}
      🌐 环境: ${process.env.NODE_ENV}
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