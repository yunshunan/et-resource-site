import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import { initLeanCloud } from './libs/leancloud';

// 加载环境变量
dotenv.config();

// 初始化LeanCloud
try {
  initLeanCloud();
  console.log('LeanCloud 已成功初始化');
} catch (error) {
  console.error('LeanCloud 初始化失败，应用将继续运行但部分功能可能受到影响:', error);
}

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 路由
app.use('/api/auth', authRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 全局错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err);
  
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message || '未知错误'
  });
});

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: `未找到路径: ${req.method} ${req.originalUrl}`
  });
});

// 导出应用
export default app; 