import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * 异步请求处理器包装函数
 * 用于处理异步控制器函数中的错误，并传递给Express错误处理中间件
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 