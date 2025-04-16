import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import resourceRoutes from './routes/resource';
import messageRoutes from './routes/message';
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

// 配置 CORS
const allowedOrigins = [
  'http://localhost:3000', // 允许默认端口
  'http://localhost:3001', // 允许备用端口
  'http://localhost:3002', // 允许当前使用的端口
  // process.env.FRONTEND_URL // 将来可以从环境变量读取生产环境 URL
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // 允许来自允许列表的源 或 没有 origin 的请求 (例如 curl, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`); // 记录被阻止的来源
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 确保 OPTIONS 被允许
  credentials: true, // 如果需要处理 cookies 或授权头
  optionsSuccessStatus: 204 // 让 OPTIONS 预检请求成功返回
};

// 应用 CORS 配置
app.use(cors(corsOptions));

// 基本安全配置 - 使用helmet添加安全相关的HTTP头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://files.zyxz123.com", "https://api.zyxz123.com", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.zyxz123.com", "https://files.zyxz123.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  // 防止通过修改Accept头来嗅探MIME类型
  noSniff: true,
  // 设置XSS过滤
  xssFilter: true,
  // 在iframe中不允许嵌入
  frameguard: { action: 'deny' }
}));

// 配置速率限制器 - 应用全局API限制
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 500, // 每个IP最多500次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});

// 认证路由的更严格限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口
  max: 50, // 每个IP最多50次认证请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '登录尝试次数过多，请15分钟后再试' },
});

// 评分和收藏操作的限制
const interactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口
  max: 10, // 每分钟最多10次操作
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '操作过于频繁，请稍后再试' },
});

// 应用全局限制
app.use(globalLimiter);

// 应用基本中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- 调试中间件：打印请求路径 ---
app.use((req, res, next) => {
  console.log(`[Route Debug] Received: ${req.method} ${req.originalUrl}`);
  next();
});
// --- 结束调试中间件 ---

// 将速率限制器应用到认证路由
app.use('/api/auth', authLimiter);

// 对评分、评论和收藏路由应用交互限制
app.use('/api/resources/:id/rate', interactionLimiter);
app.use('/api/resources/:id/comments', interactionLimiter);
app.use('/api/messages/send', interactionLimiter);

// --- 添加 /api/auth 的简单测试路由 ---
app.get('/api/auth/ping', (req, res) => {
  console.log('>>> PING /api/auth/ping route HIT!');
  res.status(200).send('Auth Pong!');
});
// --- 结束测试路由 ---

// --- 调试日志：检查 authRoutes 挂载 ---
console.log('>>> Mounting /api/auth routes...');
console.log('>>> Type of authRoutes:', typeof authRoutes, 'Is function?', typeof authRoutes === 'function');
// --- 结束调试日志 ---

// 主路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);

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

// --- 调试：打印已注册路由 ---
function printRegisteredRoutes(appInstance: any) {
  console.log('\n>>> Registered Routes:');
  function printStack(pathPrefix: string, stack: any[]) {
    if (!stack) return;
    stack.forEach((layer) => {
      if (layer.route) { // Routes registered directly on the app
        console.log(`  - ${Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ')} ${pathPrefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle?.stack) { // Router instances
        let newPrefix = pathPrefix;
        // Extract the path prefix for the router
        const match = layer.regexp.toString().match(/\^\\\/([a-zA-Z0-9_\-\/]+)/);
        if (match && match[1]) {
          newPrefix += '/' + match[1].replace(/\\\//g, '/');
        }
        printStack(newPrefix, layer.handle.stack);
      } else if (layer.name === 'bound dispatch' && layer.route) { // Routes added via router.METHOD()
         console.log(`  - ${Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(', ')} ${pathPrefix}${layer.route.path}`);
      }
    });
  }
  // Start printing from the main app stack
  if (appInstance._router && appInstance._router.stack) {
    printStack('', appInstance._router.stack);
  } else {
    console.log('  Unable to access router stack.');
  }
  console.log('>>> End of Registered Routes\n');
}

// 延迟执行打印，确保所有路由都已挂载
setTimeout(() => printRegisteredRoutes(app), 1000); 
// --- 结束调试 --- 