import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../libs/jwt';
import { AuthRequest, JwtPayload } from '../types/auth';

const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

/**
 * JWT认证中间件
 * 验证请求头中的授权令牌
 */
export const jwtAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // 从请求头获取Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: {
        message: '未提供认证令牌',
        code: 'auth/no-token'
      }
    });
  }
  
  // 检查令牌格式
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: {
        message: '认证令牌格式无效',
        code: 'auth/invalid-token-format'
      }
    });
  }
  
  const token = parts[1];
  
  try {
    // 验证令牌
    const decoded = await verifyToken<JwtPayload>(token, jwtSecret);
    
    // 将解码后的用户信息附加到请求对象
    req.user = decoded;
    
    // 继续处理请求
    next();
  } catch (error) {
    console.error('JWT验证失败:', error);
    return res.status(401).json({
      error: {
        message: '无效或过期的认证令牌',
        code: 'auth/invalid-token'
      }
    });
  }
};

/**
 * 管理员角色检查中间件
 * 要在jwtAuth中间件之后使用
 */
export const adminRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: '需要认证',
        code: 'auth/authentication-required'
      }
    });
  }
  
  // 检查管理员角色
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: '需要管理员权限',
        code: 'auth/admin-required'
      }
    });
  }
  
  next();
};

/**
 * 可选的JWT认证中间件
 * 如果令牌存在并有效，解码并附加到请求对象
 * 如果没有令牌或令牌无效，继续处理请求而不报错
 */
export const optionalJwtAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // 从请求头获取Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }
  
  // 检查令牌格式
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }
  
  const token = parts[1];
  
  try {
    // 验证令牌
    const decoded = await verifyToken<JwtPayload>(token, jwtSecret);
    
    // 将解码后的用户信息附加到请求对象
    req.user = decoded;
  } catch (error) {
    // 令牌无效，但我们不需要阻止请求
    console.warn('可选JWT验证失败:', error);
  }
  
  // 无论令牌是否有效，都继续处理请求
  next();
};

export default {
  jwtAuth,
  adminRequired,
  optionalJwtAuth
}; 