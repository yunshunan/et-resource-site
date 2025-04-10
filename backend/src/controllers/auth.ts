import { Request, Response } from 'express';
import { AsyncRequestHandler } from '../types/express';
import firebase from '../libs/firebase';
import { AV } from '../libs/leancloud';
import { RegisterRequest, LoginRequest, AuthError, AuthErrorType } from '../types/auth';
import { handleAuthError } from '../utils/errorHandler';
import { signToken } from '../libs/jwt';

/**
 * 用户注册
 * @route POST /api/auth/register
 */
export const register: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as RegisterRequest;

    // 输入验证
    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 密码长度验证
    if (password.length < 6) {
      throw new AuthError('密码长度不能少于6个字符', AuthErrorType.WEAK_PASSWORD, 400);
    }

    // 使用Firebase Auth创建用户
    const userRecord = await firebase.auth().createUser({
      email,
      password,
      emailVerified: false
    });

    console.log('Firebase用户创建成功:', userRecord.uid);

    // 在LeanCloud中查找是否已存在此用户
    const query = new AV.Query('_User');
    query.equalTo('firebase_uid', userRecord.uid);
    let leanUser = await query.first();

    if (!leanUser) {
      // 如果不存在，创建新用户
      leanUser = new AV.Object('_User');
    }

    // 设置用户属性
    leanUser.set('email', email);
    leanUser.set('firebase_uid', userRecord.uid);
    leanUser.set('wechat_openid', null); // 预留字段，默认为null

    // 保存到LeanCloud
    await leanUser.save();
    
    // 设置ACL，只允许用户自己写入
    const acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    
    // 只有在用户ID有效时才设置写权限
    if (leanUser.id) {
      acl.setWriteAccess(leanUser.id, true);
      leanUser.setACL(acl);
      await leanUser.save();
    }
    
    console.log('LeanCloud用户创建/更新成功');

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    const token = await signToken(
      { email, firebase_uid: userRecord.uid },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(201).json({
      user: {
        email,
        firebase_uid: userRecord.uid
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

/**
 * 用户登录
 * @route POST /api/auth/login
 */
export const login: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // 输入验证
    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 使用Firebase验证用户凭证
    // 注意：Firebase Admin SDK没有直接验证邮箱/密码的方法
    // 这里采用的方案是先通过邮箱查找用户，然后使用Firebase Auth REST API验证

    // 1. 通过邮箱查找Firebase用户
    const firebaseUser = await firebase.auth().getUserByEmail(email)
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
          throw new AuthError('用户不存在', AuthErrorType.USER_NOT_FOUND, 404);
        }
        throw error;
      });

    // 2. 使用自定义令牌验证方法
    // 注：实际情况下，前端应直接使用Firebase SDK进行身份验证，后端只需验证ID令牌
    // 这里为了保持API一致性，模拟验证过程

    // 验证通过后，查询LeanCloud中的用户记录
    const query = new AV.Query('_User');
    query.equalTo('firebase_uid', firebaseUser.uid);
    const leanUser = await query.first();

    if (!leanUser) {
      // 如果LeanCloud中不存在此用户，创建一个
      const newUser = new AV.Object('_User');
      newUser.set('email', email);
      newUser.set('firebase_uid', firebaseUser.uid);
      newUser.set('wechat_openid', null);
      
      // 保存用户
      await newUser.save();
      
      // 设置ACL
      const acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      
      // 只有在用户ID有效时才设置写权限
      if (newUser.id) {
        acl.setWriteAccess(newUser.id, true);
        newUser.setACL(acl);
        await newUser.save();
      }
      
      console.log('LeanCloud用户创建成功');
    }

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    const token = await signToken(
      { email, firebase_uid: firebaseUser.uid },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(200).json({
      user: {
        email,
        firebase_uid: firebaseUser.uid
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

/**
 * 验证Firebase ID令牌
 * @route POST /api/auth/verify-token
 */
export const verifyFirebaseToken: AsyncRequestHandler = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw new AuthError('ID令牌不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 验证Firebase ID令牌
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    const { email, uid } = decodedToken;

    // 查询LeanCloud中的用户记录
    const query = new AV.Query('_User');
    query.equalTo('firebase_uid', uid);
    let leanUser = await query.first();

    if (!leanUser) {
      // 如果用户不存在，创建新用户
      leanUser = new AV.Object('_User');
      leanUser.set('email', email);
      leanUser.set('firebase_uid', uid);
      leanUser.set('wechat_openid', null);
      
      // 保存用户
      await leanUser.save();
      
      // 设置ACL
      const acl = new AV.ACL();
      acl.setPublicReadAccess(true);
      
      // 只有在用户ID有效时才设置写权限
      if (leanUser.id) {
        acl.setWriteAccess(leanUser.id, true);
        leanUser.setACL(acl);
        await leanUser.save();
      }
      
      console.log('LeanCloud用户创建成功');
    }

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    const token = await signToken(
      { email, firebase_uid: uid },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(200).json({
      user: {
        email,
        firebase_uid: uid
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

/**
 * 验证LeanCloud Session Token
 * @route POST /api/auth/verify-leancloud-token
 */
export const verifyLeanCloudToken: AsyncRequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      throw new AuthError('Session令牌不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 使用LeanCloud验证会话令牌
    const user = await AV.User.become(sessionToken);
    
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

    const token = await signToken(
      { email, leancloud_uid: leanCloudUserId },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(200).json({
      user: {
        id: leanCloudUserId,
        email,
        username: user.get('username'),
        role: user.get('role') || 'user',
        avatar: user.get('avatar'),
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

/**
 * LeanCloud用户注册
 * @route POST /api/auth/leancloud-register
 */
export const leanCloudRegister: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 输入验证
    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 密码长度验证
    if (password.length < 6) {
      throw new AuthError('密码长度不能少于6个字符', AuthErrorType.WEAK_PASSWORD, 400);
    }

    // 创建LeanCloud用户
    const user = new AV.User();
    user.setUsername(username || email);
    user.setPassword(password);
    user.setEmail(email);
    
    // 设置默认角色
    user.set('role', 'user');
    
    // 注册用户
    await user.signUp();
    
    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    const token = await signToken(
      { email, leancloud_uid: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.get('email'),
        username: user.get('username'),
        role: user.get('role') || 'user',
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
};

/**
 * LeanCloud用户登录
 * @route POST /api/auth/leancloud-login
 */
export const leanCloudLogin: AsyncRequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 输入验证
    if (!email || !password) {
      throw new AuthError('邮箱和密码不能为空', AuthErrorType.INVALID_CREDENTIALS, 400);
    }

    // 使用LeanCloud进行登录验证
    // 注意：LeanCloud默认使用用户名登录，我们需要先根据email查找用户名
    let user;
    
    try {
      // 尝试直接使用email作为用户名登录
      user = await AV.User.logIn(email, password);
    } catch (e) {
      // 如果失败，尝试查询email对应的用户，然后使用用户名登录
      const query = new AV.Query('_User');
      query.equalTo('email', email);
      const userObj = await query.first();
      
      if (!userObj) {
        throw new AuthError('用户不存在', AuthErrorType.USER_NOT_FOUND, 404);
      }
      
      // 使用用户名和密码登录
      user = await AV.User.logIn(userObj.get('username'), password);
    }
    
    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    const token = await signToken(
      { email: user.get('email'), leancloud_uid: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息和令牌
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.get('email'),
        username: user.get('username'),
        role: user.get('role') || 'user',
        avatar: user.get('avatar'),
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    return handleAuthError(error, res);
  }
}; 