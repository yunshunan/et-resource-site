import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';

// 扩展 SignOptions 类型以正确处理 expiresIn
interface ExtendedSignOptions extends Omit<SignOptions, 'expiresIn'> {
  expiresIn?: string | number;
}

/**
 * 类型安全的JWT令牌签名函数
 */
export const signToken = (
  payload: string | object | Buffer,
  secret: string,
  options?: ExtendedSignOptions
): Promise<string> => {
  if (!secret) throw new Error('JWT_SECRET is required');
  
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      options as SignOptions,
      (err, token) => {
        if (err || !token) reject(err || new Error('Token generation failed'));
        else resolve(token);
      }
    );
  });
};

/**
 * 类型安全的JWT令牌验证函数
 */
export const verifyToken = <T extends object = JwtPayload>(
  token: string,
  secret: string,
  options?: VerifyOptions
): Promise<T> => {
  if (!secret) throw new Error('JWT_SECRET is required');
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, options, (err, decoded) => {
      if (err || !decoded) {
        reject(err || new Error('Token verification failed'));
      } else {
        resolve(decoded as T);
      }
    });
  });
};

export default {
  signToken,
  verifyToken
}; 