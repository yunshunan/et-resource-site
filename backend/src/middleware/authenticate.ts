import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../libs/jwt';
import { JwtPayload } from '../types/auth'; // Assuming JwtPayload is defined in auth types
import { AuthError, AuthErrorType } from '../types/auth';
import { handleAuthError } from '../utils/errorHandler';
import { AsyncRequestHandler } from '../types/express';

// Extend Express Request type to include 'user' property
// This should ideally be in a global type declaration file (e.g., types/express.d.ts)
// But for simplicity here, we'll assert the type later.
/*
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
*/

export const authenticate: AsyncRequestHandler = async (req, res, next) => {
  console.log(`[Authenticate] Request received for: ${req.method} ${req.originalUrl}`);
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    console.log(`[Authenticate] Token received: ${token ? token.substring(0, 10) + '...' : 'None'}`);

    if (!token) {
      throw new AuthError('未提供认证令牌', AuthErrorType.MISSING_TOKEN, 401);
    }

    // 2. Verify token
    const jwtSecret = process.env.JWT_SECRET;
    console.log(`[Authenticate] JWT_SECRET used: ${jwtSecret?.substring(0, 5)}...`); // Log the secret used for verification
    if (!jwtSecret) {
      console.error('JWT_SECRET环境变量未设置 - 无法验证令牌');
      throw new AuthError('服务器内部错误', AuthErrorType.SERVER_ERROR, 500);
    }

    console.log('[Authenticate] Verifying token...');
    const decodedPayload = await verifyToken<JwtPayload>(token, jwtSecret);
    console.log('[Authenticate] Token verified successfully. Decoded payload:', decodedPayload);

    // 3. Attach user to request object
    req.user = decodedPayload;
    console.log('[Authenticate] Payload attached to req.user:', req.user);

    // 4. Call next middleware
    if (next) {
      console.log('[Authenticate] Calling next() middleware.');
      next();
    } else {
      console.warn('[Authenticate] next() function is missing!');
    }

  } catch (error: any) {
    console.error('[Authenticate] Error during authentication:', error.name, error.message);
    // Handle token verification errors (expired, invalid signature etc.)
    if (error.name === 'TokenExpiredError') {
      return handleAuthError(new AuthError('令牌已过期', AuthErrorType.TOKEN_EXPIRED, 401), res);
    } else if (error.name === 'JsonWebTokenError') {
      return handleAuthError(new AuthError('无效的令牌', AuthErrorType.INVALID_TOKEN, 401), res);
    } else {
      // Handle other errors (like our custom AuthErrors or unexpected errors)
      return handleAuthError(error, res);
    }
  }
}; 