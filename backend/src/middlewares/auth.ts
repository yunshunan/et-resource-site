import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../libs/jwt';
import { JwtPayload } from '../types/auth';
import { asyncHandler } from './asyncHandler';
import { AV } from '../libs/leancloud';

/**
 * 认证中间件
 * 验证请求中的JWT令牌，检查令牌是否已失效，并将用户信息添加到请求对象
 */
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, message: '无效的认证令牌格式' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    // 1. 验证令牌签名和有效期
    // 使用我们自定义的 JwtPayload 类型
    const decodedToken = await verifyToken<JwtPayload>(token, jwtSecret);

    // 2. 检查令牌是否已被标记为失效
    const userId = decodedToken.leancloud_uid;
    const tokenIssuedAt = decodedToken.iat; // JWT 签发时间 (秒)

    if (!userId || !tokenIssuedAt) {
      console.error('JWT 缺少必要的 leancloud_uid 或 iat 字段');
      return res.status(401).json({ code: 401, message: '无效的认证令牌' });
    }

    const query = new AV.Query('InvalidatedToken');
    query.equalTo('userId', AV.Object.createWithoutData('_User', userId));
    // 按失效时间降序排列，获取最新的记录
    query.descending('invalidatedAt'); 
    const latestInvalidation = await query.first({ useMasterKey: true }); // 查询黑名单也用MasterKey确保权限

    if (latestInvalidation) {
      const invalidatedAt = latestInvalidation.get('invalidatedAt') as Date;
      // 比较时间戳 (iat 是秒，需要 * 1000 转换为毫秒)
      if (tokenIssuedAt * 1000 < invalidatedAt.getTime()) {
        console.log(`Token for user ${userId} issued at ${new Date(tokenIssuedAt * 1000)} was invalidated at ${invalidatedAt}`);
        return res.status(401).json({ code: 401, message: '会话已失效，请重新登录' });
      }
    }

    // 3. 将用户信息添加到请求对象 (确保类型正确)
    // 我们将解码后的完整 payload (包含 role) 赋值给 req.user
    req.user = decodedToken;
    
    next();
  } catch (error: any) {
    // 处理 verifyToken 可能抛出的错误 (例如 TokenExpiredError, JsonWebTokenError)
    console.error('认证过程中出错:', error.name, error.message);
    return res.status(401).json({
      code: 401,
      message: error.name === 'TokenExpiredError' ? '会话已过期，请重新登录' : '无效的认证令牌',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 管理员权限验证中间件
 * 确保只有拥有admin角色的用户才能访问受保护资源
 */
export const authorizeAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 开发模式绕过(仅用于测试)
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_ADMIN_AUTH === 'true') {
    console.log('⚠️ 警告：开发模式下绕过管理员权限验证');
    return next();
  }

  // 检查用户是否已认证
  if (!req.user) {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }

  // 检查用户角色
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要管理员权限'
    });
  }

  // 用户是管理员，继续处理请求
  next();
}); 