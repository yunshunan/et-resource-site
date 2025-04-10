import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    // 扩展Request类型，添加用户属性
    interface Request {
      user?: JwtPayload & { 
        firebase_uid: string;
        email?: string;
      };
    }
  }
}

// 异步请求处理器类型定义 - 修复允许返回 Response 对象
export type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next?: NextFunction
) => Promise<void | Response<ResBody>>; 