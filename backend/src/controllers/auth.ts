import { Request, Response } from 'express';
import { AsyncRequestHandler } from '../types/express';
import { AV } from '../libs/leancloud';
import { RegisterRequest, LoginRequest, AuthError, AuthErrorType, UserResponse } from '../types/auth';
import { handleAuthError } from '../utils/errorHandler';
import { signToken } from '../libs/jwt';
import { AuthRequest } from '../types/auth';

console.log('>>> [controllers/auth.ts] Module start'); // <-- 日志 1: 文件开始

/**
 * 用户注册 (使用 LeanCloud)
 * @route POST /api/auth/register
 */
export const register: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body as RegisterRequest; // Assuming username might be needed

    // --- Basic Input Validation ---
    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }
    if (password.length < 6) {
      throw new AuthError('密码长度不能少于6个字符', AuthErrorType.WEAK_PASSWORD, 400);
    }
    // Add username validation if required
    if (!username) {
        throw new AuthError('用户名不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // --- Use LeanCloud to Create User ---
    const user = new AV.User();
    user.setUsername(username); // Use username for LeanCloud username
    user.setEmail(email);
    user.setPassword(password);

    // Attempt to sign up the user in LeanCloud
    await user.signUp();

    console.log('LeanCloud用户创建成功:', user.id); // user.id is the objectId

    // --- Generate JWT Token with LeanCloud User Info ---
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Log error on server, send generic message to client
      console.error('JWT_SECRET环境变量未设置');
      throw new Error('服务器内部错误'); 
    }

    // Agreed payload structure: { userId: string; email: string; }
    const payload = {
      userId: user.id, // Use LeanCloud objectId as userId
      email: user.getEmail(), // Get email from the created user object
    };

    const token = await signToken(
      payload,
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // --- Return User Info and Token ---
    // Exclude sensitive info like password from the response
    res.status(201).json({
      user: {
        userId: user.id, // LeanCloud objectId
        email: user.getEmail(),
        username: user.getUsername(),
      },
      token
    });

  } catch (error: any) {
    // --- LeanCloud Error Handling ---
    // Check for specific LeanCloud error codes (e.g., username/email already exists)
    if (error.code === 202) { // Username has already been taken
         handleAuthError(new AuthError('用户名已被占用', AuthErrorType.USERNAME_TAKEN, 409), res);
    } else if (error.code === 203) { // Email has already been taken
        handleAuthError(new AuthError('邮箱已被注册', AuthErrorType.EMAIL_TAKEN, 409), res);
    } else if (error.code === 217) { // Invalid username. It should only contain alphanumeric characters, underscores, and dashes.
        handleAuthError(new AuthError('用户名格式无效（只能包含字母、数字、下划线和破折号）', AuthErrorType.INVALID_USERNAME, 400), res);
    } else if (error.code === 218) { // Invalid password. It should contain 6 to 32 characters.
        // We already check length, but LeanCloud might have other rules
         handleAuthError(new AuthError('密码格式无效', AuthErrorType.WEAK_PASSWORD, 400), res);
    } else {
      // Handle other potential errors (like network issues, our custom AuthErrors)
      handleAuthError(error, res);
    }
  }
};

/**
 * 用户登录 (使用 LeanCloud)
 * @route POST /api/auth/login
 */
export const login: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // --- Basic Input Validation ---
    if (!email || !password) {
      throw new AuthError('邮箱或密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // --- Use LeanCloud to Log In User ---
    // LeanCloud supports login with username or email
    const user = await AV.User.logIn(email, password);

    console.log('LeanCloud用户登录成功:', user.id);

    // --- Generate JWT Token ---
    const jwtSecret = process.env.JWT_SECRET;
    console.log(`[Login] JWT_SECRET used: ${jwtSecret?.substring(0, 5)}...`); // Log the secret used for signing
    if (!jwtSecret) {
      console.error('JWT_SECRET环境变量未设置');
      throw new Error('服务器内部错误');
    }

    // Agreed payload structure: { userId: string; email: string; }
    const payload = {
      userId: user.id, // CRITICAL: Ensure key is userId, value is LeanCloud user.id
      email: user.getEmail(),
    };
    console.log('[Login] Generating JWT with payload:', payload); // Log the payload structure

    const token = await signToken(
      payload, // Ensure this correct payload is passed
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // --- Return User Info and Token ---
    // Ensure the returned user object uses userId consistently
    res.status(200).json({
      user: {
        userId: user.id, // Use userId here for consistency
        email: user.getEmail(),
        username: user.getUsername(),
        // role: user.get('role'),
        // avatar: user.get('avatar')?.url(),
      },
      token
    });

  } catch (error: any) {
    // --- LeanCloud Error Handling ---
    // Specific LeanCloud login errors
    if (error.code === 210) { // Invalid username/password combination
      handleAuthError(new AuthError('邮箱或密码错误', AuthErrorType.INVALID_CREDENTIALS, 401), res);
    } else if (error.code === 211) { // Could not find user
      // This might overlap with 210, but handle explicitly if needed
      handleAuthError(new AuthError('用户不存在', AuthErrorType.USER_NOT_FOUND, 404), res);
    } else if (error.code === 219) { // Login failed too many times, please try again later
      handleAuthError(new AuthError('登录尝试次数过多，请稍后再试', AuthErrorType.TOO_MANY_ATTEMPTS, 429), res); // Need to add TOO_MANY_ATTEMPTS to enum
    }
    // Handle other potential errors
    handleAuthError(error, res);
  }
};

/**
 * 验证LeanCloud Session Token
 * @route POST /api/auth/verify-leancloud-token
 */
console.log('>>> [controllers/auth.ts] Defining verifyLeanCloudToken...'); // <-- 日志 2: 定义函数前
export const verifyLeanCloudToken: AsyncRequestHandler = async (req, res) => {
  console.log('>>> [controllers/auth.ts] verifyLeanCloudToken handler ENTERED'); // <-- 日志 3: 函数入口
  try {
    const { sessionToken } = req.body;
    console.log('>>> [controllers/auth.ts] verifyLeanCloudToken - Received sessionToken:', sessionToken ? '***' : 'null/undefined'); // 日志4：收到 Token

    if (!sessionToken) {
      throw new AuthError('Session令牌不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 使用LeanCloud验证会话令牌
    console.log('>>> [controllers/auth.ts] verifyLeanCloudToken - Calling AV.User.become...'); // 日志5：调用 become
    const user = await AV.User.become(sessionToken);
    console.log('>>> [controllers/auth.ts] verifyLeanCloudToken - AV.User.become returned:', user ? `User ID: ${user.id}` : 'null'); // 日志6：become 结果
    
    if (!user) {
      throw new AuthError('无效的会话令牌', AuthErrorType.INVALID_TOKEN, 401);
    }
    
    const email = user.get('email');
    const leanCloudUserId = user.id;
    
    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    // CRITICAL FIX: Generate JWT payload with 'userId' key
    const payload = {
      userId: leanCloudUserId, // Use userId as the key
      email, // email is already defined above
      // role: user.get('role') || 'user' // Optionally add role here too
    };
    console.log('[verifyLeanCloudToken] Generating JWT with payload:', payload);

    const token = await signToken(
      payload, // Pass the corrected payload
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    // CRITICAL FIX: Return user object with 'userId' key for consistency
    res.status(200).json({
      user: {
        userId: leanCloudUserId, // Use userId here
        email,
        username: user.get('username'),
        role: user.get('role') || 'user',
        avatar: user.get('avatar')?.url(), // Corrected avatar fetching
        createdAt: user.createdAt?.toISOString() // Use ISO string
      },
      token // The token now contains userId
    });
  } catch (error) {
    console.error('>>> [controllers/auth.ts] verifyLeanCloudToken - ERROR caught:', error); // 日志7：捕获错误
    handleAuthError(error, res);
  }
};

/**
 * LeanCloud用户注册
 * @route POST /api/auth/leancloud-register
 */
export const leanCloudRegister: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as RegisterRequest;

    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }
    if (password.length < 6) {
      throw new AuthError('密码长度不能少于6个字符', AuthErrorType.WEAK_PASSWORD, 400);
    }

    const user = new AV.User();
    user.setUsername(email);
    user.setEmail(email);
    user.setPassword(password);
    // 注册时默认设置 role 为 'user'
    user.set('role', 'user'); 

    // 尝试注册用户
    const leanUser = await user.signUp();
    console.log('LeanCloud 用户注册成功', leanUser.id);

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    // 从注册后的用户对象获取角色
    const userRole = leanUser.get('role') || 'user';

    const token = await signToken(
      { email, leancloud_uid: leanUser.id, role: userRole }, // <-- 添加 role
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    res.status(201).json({
      user: {
        id: leanUser.id,
        email,
        username: leanUser.getUsername(),
        role: userRole, // 在响应中也返回角色
        createdAt: leanUser.createdAt?.toISOString()
      },
      token
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * LeanCloud用户登录
 * @route POST /api/auth/leancloud-login
 */
export const leanCloudLogin: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 使用邮箱和密码登录
    const user = await AV.User.logIn(email, password);
    console.log('LeanCloud 用户登录成功', user.id);

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    // 从登录后的用户对象获取角色
    const userRole = user.get('role') || 'user';

    const token = await signToken(
      { email, leancloud_uid: user.id, role: userRole }, // <-- 添加 role
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    res.status(200).json({
      user: {
        id: user.id,
        email,
        username: user.getUsername(),
        role: userRole, // 在响应中也返回角色
        createdAt: user.createdAt?.toISOString()
      },
      token
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * 获取当前登录用户的信息
 * @route GET /api/auth/me
 * @access Private (需要认证)
 */
export const getMe: AsyncRequestHandler<AuthRequest> = async (req, res) => {
  // authenticate 中间件已将解码后的用户信息附加到 req.user
  // req.user 的结构应与 JWT Payload 一致 (例如 { userId: string; email: string; role?: string; ... })
  const jwtPayload = req.user;

  if (!jwtPayload || !jwtPayload.userId) {
    // 理论上不应该发生，因为 authenticate 会处理
    res.status(401).json({ success: false, message: '无效的认证信息' });
    return; // Still need to return to exit the function
  }

  try {
    // 根据 JWT 中的 userId (LeanCloud ObjectId) 查询最新的用户信息
    const userQuery = new AV.Query('_User');
    // Fetch the full user object to ensure methods are available
    const leancloudUser = await userQuery.get(jwtPayload.userId);

    if (!leancloudUser) {
      // 用户在 LeanCloud 中被删除？
      throw new AuthError('无法找到用户信息', AuthErrorType.USER_NOT_FOUND, 404);
    }

    // Explicitly cast to AV.User to access methods
    const lcUser = leancloudUser as AV.User;

    // 构建要返回的用户信息对象
    const userInfo: UserResponse = {
      userId: lcUser.id!, // Assert that id is non-null
      email: lcUser.getEmail(), // Use type assertion
      username: lcUser.getUsername(), // Use type assertion
      role: lcUser.get('role') || 'user', // 从 LeanCloud 获取最新角色
      avatar: lcUser.get('avatar')?.url(), // 获取头像 URL
      createdAt: lcUser.createdAt?.toISOString(),
      // 可以添加其他需要返回的字段
    };

    res.status(200).json({ success: true, user: userInfo });

  } catch (error: any) {
    // 处理 LeanCloud 查询错误或其他错误
    console.error('获取用户信息失败:', error);
    if (error.code === 101) { // Object not found.
       handleAuthError(new AuthError('无法找到用户信息', AuthErrorType.USER_NOT_FOUND, 404), res);
    } else {
       handleAuthError(error, res);
    }
  }
}; 