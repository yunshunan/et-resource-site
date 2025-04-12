import { Request, Response, NextFunction } from 'express';
import { AV } from '../libs/leancloud'; // 使用命名导入
import { verifyToken } from '../libs/jwt';
import { AuthRequest, JwtPayload, AuthError, AuthErrorType } from '../types/auth'; // 导入 AuthError

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
    // 验证令牌签名
    const decoded = await verifyToken<JwtPayload>(token, jwtSecret);

    // --- 新增：检查 Token 黑名单 ---
    const userId = decoded.leancloud_uid; // 假设 JWT payload 中存储的是 leancloud_uid
    const issuedAt = decoded.iat; // 获取令牌签发时间 (秒)

    if (!userId || !issuedAt) {
      // 如果 JWT 缺少必要信息，视为无效
      throw new AuthError('无效的令牌载荷', AuthErrorType.INVALID_TOKEN, 401);
    }

    // 查询 TokenBlacklist
    const query = new AV.Query('TokenBlacklist');
    query.equalTo('userId', AV.Object.createWithoutData('_User', userId));
    query.descending('invalidatedAt'); // 按失效时间降序排列，获取最新的
    query.limit(1);
    const blacklistEntry = await query.first();

    if (blacklistEntry) {
      const invalidatedAt = blacklistEntry.get('invalidatedAt') as Date;
      // 比较时间：令牌签发时间(转换为毫秒) 是否早于 最新的失效时间点
      if (issuedAt * 1000 < invalidatedAt.getTime()) {
        throw new AuthError('会话已失效，请重新登录', AuthErrorType.INVALID_TOKEN, 401);
      }
    }
    // --- 黑名单检查结束 ---

    // 将解码后的用户信息附加到请求对象
    req.user = decoded;
    
    // 继续处理请求
    next();
  } catch (error) {
    console.error('JWT 验证或黑名单检查失败:', error);
    // 统一处理 AuthError 和其他 JWT 验证错误
    if (error instanceof AuthError) {
      // 使用正确的属性名 type
      return res.status(error.statusCode).json({ 
        error: { message: error.message, code: error.type } 
      });
    }
    // 处理 verifyToken 可能抛出的标准 JWT 错误 (如 TokenExpiredError, JsonWebTokenError)
    return res.status(401).json({
      error: {
        message: '无效或过期的认证令牌', // 通用错误信息
        code: 'auth/invalid-token' // 保留通用代码
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