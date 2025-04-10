import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../libs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from './asyncHandler';
import { AV } from '../libs/leancloud';

// 认证中间件类型定义
interface AuthUser extends JwtPayload {
  firebase_uid: string;
  email?: string;
}

/**
 * 认证中间件
 * 验证请求中的JWT令牌，并将用户信息添加到请求对象
 */
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // 从Authorization头部获取令牌
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌'
    });
  }

  // 提取令牌
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌格式'
    });
  }

  try {
    // 验证令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    // 验证令牌并获取用户信息
    const decodedToken = await verifyToken<AuthUser>(token, jwtSecret);
    
    // 将用户信息添加到请求对象
    req.user = decodedToken;
    
    // 继续处理请求
    next();
  } catch (error: any) {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}); 