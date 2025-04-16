import { AV } from '../libs/leancloud'; // 导入 LeanCloud SDK

// 假设 InvalidatedToken Class 已经在 LeanCloud 控制台创建
// 包含字段：userId (Pointer<_User>), invalidatedAt (Date)
const TokenBlacklist = AV.Object.extend('InvalidatedToken'); // 修改为正确的Class名称

/**
 * 使指定用户的所有旧 JWT 令牌失效
 * 通过在 InvalidatedToken 中为该用户创建一个新的记录来实现。
 * jwtAuth 中间件会检查令牌签发时间是否早于最新的失效记录时间。
 * @param userId 要使其令牌失效的用户 ID
 */
export const invalidateUserTokens = async (userId: string): Promise<void> => {
  try {
    // 在开发环境中，我们不尝试自动创建Class
    // 这应该在LeanCloud控制台中手动创建
    if (process.env.NODE_ENV === 'development') {
      console.log('提示: 确保在LeanCloud控制台已创建了InvalidatedToken Class');
      console.log('字段要求: userId(Pointer到_User), invalidatedAt(Date)');
    }

    const tokenEntry = new TokenBlacklist();
    // 使用 createWithoutData 创建 Pointer，避免查询整个 User 对象
    tokenEntry.set('userId', AV.Object.createWithoutData('_User', userId));
    tokenEntry.set('invalidatedAt', new Date());
    // 显式使用 Master Key 保存失效记录
    await tokenEntry.save(null, { useMasterKey: true });
    console.log(`Tokens invalidated for user ${userId} at ${new Date()}`);

    // 云函数clearUserCache不存在，已移除相关代码

  } catch (error) {
    console.error(`Error invalidating tokens for user ${userId}:`, error);
    console.error('详细错误:', JSON.stringify(error, null, 2));
    // 在开发环境中抛出错误，便于调试
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    // 在生产环境中仅记录日志，不影响主要功能
  }
}; 