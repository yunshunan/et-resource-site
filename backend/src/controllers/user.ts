import { Request, Response } from 'express';
import { AV } from '../libs/leancloud';
import { AuthError, AuthErrorType } from '../types/auth'; // 移除了 AuthRequest
import { invalidateUserTokens } from '../utils/tokenManager'; // 导入令牌失效函数
import { asyncHandler } from '../middlewares/asyncHandler'; // 导入 asyncHandler

/**
 * 更新指定用户的角色 (仅限管理员)
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // 获取 URL 中的用户 ID
  const { role } = req.body; // 从请求体中获取新角色

  // 开发模式下的模拟模式
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_MODE === 'true') {
    console.log('⚠️ 模拟模式：将返回模拟响应，但仍执行输入验证');
    
    // 仍然执行输入验证
    if (!role || (role !== 'user' && role !== 'admin')) {
      throw new AuthError('无效的角色值，必须是 \'user\' 或 \'admin\'', AuthErrorType.INVALID_CREDENTIALS, 400);
    }
    
    return res.status(200).json({
      message: '模拟模式：用户角色更新成功',
      user: {
        id: id,
        email: 'user@example.com',
        role: role,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // 1. 输入验证
  if (!role || (role !== 'user' && role !== 'admin')) {
    throw new AuthError('无效的角色值，必须是 \'user\' 或 \'admin\'', AuthErrorType.INVALID_CREDENTIALS, 400);
  }

  // 2. 查找用户 - 只是为了确认用户存在并获取当前角色
  const userQuery = new AV.Query('_User');
  let targetUser: AV.User;
  let oldRole: string;
  
  try {
    targetUser = await userQuery.get(id) as AV.User;
    oldRole = targetUser.get('role') || 'user'; // 获取旧角色，默认为 'user'
  } catch (error: any) { // LeanCloud 的 get 可能抛出错误
    if (error.code === 101) { // LeanCloud 对象未找到错误码
      throw new AuthError('用户未找到', AuthErrorType.USER_NOT_FOUND, 404);
    } else {
      console.error('查询用户失败:', error);
      throw new AuthError('查询用户时出错', AuthErrorType.SERVER_ERROR, 500);
    }
  }

  // 3. 检查角色是否实际改变
  if (oldRole === role) {
    res.status(200).json({ message: '用户角色未改变', user: targetUser.toJSON() });
    return;
  }

  // 4. 更新角色 - 使用不同的方法：使用 Object API 而不是 User API
  try {
    // 创建 _User Class 的对象引用，但不加载数据
    const userObject = AV.Object.createWithoutData('_User', id);
    
    // 直接设置角色
    userObject.set('role', role);
    
    // 保存，明确不获取最新数据(因为我们不需要)，但使用 Master Key
    await userObject.save(null, { fetchWhenSave: false, useMasterKey: true });
    
    console.log(`User ${id} role updated to ${role}`);
  } catch (error) {
    console.error(`更新用户 ${id} 角色失败:`, error);
    console.error(JSON.stringify(error, null, 2)); // 添加更详细的错误输出
    throw new AuthError('更新用户角色时出错', AuthErrorType.SERVER_ERROR, 500);
  }

  // 5. 使旧 Token 失效
  try {
    if (process.env.SKIP_TOKEN_INVALIDATION === 'true' && process.env.NODE_ENV === 'development') {
      console.log('⚠️ 开发模式: 跳过令牌失效步骤');
    } else {
      await invalidateUserTokens(id);
    }
  } catch (tokenError) {
    console.error('令牌失效过程中出错:', tokenError);
    // 在开发环境中，如果令牌失效过程出错，我们仍然继续
    if (process.env.NODE_ENV !== 'development') {
      throw new AuthError('更新角色成功但令牌失效失败', AuthErrorType.SERVER_ERROR, 500);
    }
  }

  // 6. 返回成功响应
  res.status(200).json({
    message: '用户角色更新成功，旧会话已失效',
    user: { 
      id, 
      role,
      updatedAt: new Date().toISOString() 
    }
  });
}); 