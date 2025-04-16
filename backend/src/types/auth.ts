import { Request } from 'express';
import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken';

// 添加 AuthRequest 接口定义并导出
export interface AuthRequest extends Request {
  user?: JwtPayload; // JWT 解码后的用户信息，设为可选
}

// 扩展JWT载荷类型
export interface JwtPayload extends JwtPayloadBase {
  userId: string;
  email: string;
  role?: string;
}

// 认证错误类型
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_TOKEN = 'MISSING_TOKEN',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  INVALID_USERNAME = 'INVALID_USERNAME',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR'
}

// 自定义认证错误
export class AuthError extends Error {
  public type: AuthErrorType;
  public statusCode: number;

  constructor(message: string, type: AuthErrorType, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

// 注册请求体类型
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

// 登录请求体类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 用户响应类型
export interface UserResponse {
  userId: string;
  email: string;
  username?: string;
  wechat_openid?: string | null;
  role?: string;
  avatar?: string;
  createdAt?: string;
  [key: string]: any;
}

// 认证响应类型
export interface AuthResponse {
  user: UserResponse;
  token: string;
} 