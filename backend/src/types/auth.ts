import { Request } from 'express';

// JWT载荷类型
export interface JwtPayload {
  email: string;
  firebase_uid?: string;
  leancloud_uid?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// 扩展Express的Request类型，添加user属性
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// 认证错误类型
export enum AuthErrorType {
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVER_ERROR = 'SERVER_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
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
}

// 登录请求体类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 用户响应类型
export interface UserResponse {
  email: string;
  firebase_uid: string;
  wechat_openid?: string | null;
  [key: string]: any;
}

// 认证响应类型
export interface AuthResponse {
  user: UserResponse;
  token: string;
} 