import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import resourceRoutes from './routes/resource';
import { initLeanCloud } from './libs/leancloud';
import { dingTalkBot } from './config/dingtalkAlert';

// 扩展错误接口
interface AppError extends Error {
  statusCode?: number;
  code?: number;
  type?: string;
}

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

// 配置速率限制器
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 分钟
	max: 100, // 每个窗口每个 IP 最多 100 次请求
	standardHeaders: true, // 返回 RateLimit-* 头信息
	legacyHeaders: false, // 禁用 X-RateLimit-* 头信息
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});

// 应用基本中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 将速率限制器应用到认证路由
app.use('/api/auth', authLimiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);

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
app.use(async (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err);
  
  // 只对 500 级别的错误进行钉钉报警
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500 && dingTalkBot) {
    try {
      // 异步发送钉钉报警，不阻塞响应
      dingTalkBot.sendErrorAlert(err, req).catch(alertError => {
        console.error('发送钉钉报警失败:', alertError);
      });
    } catch (alertError) {
      console.error('发送钉钉报警过程中出错:', alertError);
    }
  }
  
  res.status(statusCode).json({
    code: statusCode,
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