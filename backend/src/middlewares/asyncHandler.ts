import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * 异步请求处理器包装函数
 * 用于处理异步控制器函数中的错误，并传递给Express错误处理中间件
 */
export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}; 