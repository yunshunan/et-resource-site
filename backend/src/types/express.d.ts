import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
// Remove jsonwebtoken import if not directly used here
// import { JwtPayload as JwtPayloadBase } from 'jsonwebtoken'; 
import { JwtPayload as AppJwtPayload } from './auth'; // Import our custom payload type

declare global {
  namespace Express {
    // 扩展Request类型，使用我们定义的JwtPayload
    interface Request {
      user?: AppJwtPayload; // Use the payload structure from types/auth.ts
      // Remove the old Firebase-based structure
      /*
      user?: JwtPayloadBase & { 
        firebase_uid: string;
        email?: string;
      };
      */
    }
  }
}

// 异步请求处理器类型定义 - 调整返回值类型以符合Express标准
export type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next?: NextFunction
) => Promise<void>; // Changed return type to Promise<void> 