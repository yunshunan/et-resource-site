import { Response } from 'express';
import { AuthError, AuthErrorType } from '../types/auth';

/**
 * 统一处理认证错误并发送响应
 */
export const handleAuthError = (error: any, res: Response): void => {
  console.error('认证错误:', error);

  // 处理已知的AuthError类型
  if (error instanceof AuthError) {
    const authError = error as AuthError;
    res.status(authError.statusCode).json({
      code: authError.statusCode,
      type: authError.type,
      message: authError.message
    });
    return; // Exit function after handling
  }

  // 处理其他未知错误
  res.status(500).json({
    code: 500,
    type: AuthErrorType.SERVER_ERROR,
    message: '服务器内部错误',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
  // No explicit return here, as the function return type is void
}; 