import { Response } from 'express';
import { AuthError, AuthErrorType } from '../types/auth';
import firebase from '../libs/firebase';

/**
 * 处理Firebase错误，转换为自定义AuthError
 */
export const handleFirebaseError = (error: any): AuthError => {
  const errorCode = error.code || '';
  
  // 根据Firebase错误代码转换为自定义错误类型
  if (errorCode.includes('auth/invalid-email')) {
    return new AuthError('邮箱格式无效', AuthErrorType.INVALID_EMAIL, 400);
  }
  
  if (errorCode.includes('auth/weak-password')) {
    return new AuthError('密码强度不足，至少需要6个字符', AuthErrorType.WEAK_PASSWORD, 400);
  }
  
  if (errorCode.includes('auth/email-already-exists') || errorCode.includes('auth/email-already-in-use')) {
    return new AuthError('该邮箱已被注册', AuthErrorType.EMAIL_EXISTS, 409);
  }
  
  if (errorCode.includes('auth/user-not-found')) {
    return new AuthError('用户不存在', AuthErrorType.USER_NOT_FOUND, 404);
  }
  
  if (errorCode.includes('auth/wrong-password') || errorCode.includes('auth/invalid-credential')) {
    return new AuthError('邮箱或密码错误', AuthErrorType.INVALID_CREDENTIALS, 401);
  }
  
  // 默认情况，返回服务器错误
  console.error('未处理的Firebase错误:', error);
  return new AuthError('服务器内部错误', AuthErrorType.SERVER_ERROR, 500);
};

/**
 * 统一处理认证错误并发送响应
 */
export const handleAuthError = (error: any, res: Response): Response => {
  console.error('认证错误:', error);

  // 处理已知的AuthError类型
  if (error instanceof AuthError) {
    const authError = error as AuthError;
    return res.status(authError.statusCode).json({
      code: authError.statusCode,
      type: authError.type,
      message: authError.message
    });
  }

  // 处理Firebase错误
  if (error.code && typeof error.code === 'string' && error.code.startsWith('auth/')) {
    // Firebase错误处理
    switch (error.code) {
      case 'auth/email-already-exists':
        return res.status(409).json({
          code: 409,
          type: AuthErrorType.USER_EXISTS,
          message: '该邮箱已被注册'
        });
      
      case 'auth/invalid-email':
        return res.status(400).json({
          code: 400,
          type: AuthErrorType.INVALID_EMAIL,
          message: '无效的邮箱地址'
        });
      
      case 'auth/weak-password':
        return res.status(400).json({
          code: 400,
          type: AuthErrorType.WEAK_PASSWORD,
          message: '密码强度不足'
        });
      
      default:
        return res.status(500).json({
          code: 500,
          type: AuthErrorType.INTERNAL_ERROR,
          message: '认证服务错误',
          detail: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  // 处理其他未知错误
  return res.status(500).json({
    code: 500,
    type: AuthErrorType.INTERNAL_ERROR,
    message: '服务器内部错误',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}; 