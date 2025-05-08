/**
 * localForage配置
 * 使用IndexedDB进行高效的本地数据缓存
 */

import localforage from 'localforage';

// 创建消息缓存实例
export const messageCache = localforage.createInstance({
  name: 'etResources',
  storeName: 'messages',
  description: '消息数据的缓存存储'
});

// 创建联系人缓存实例
export const contactsCache = localforage.createInstance({
  name: 'etResources',
  storeName: 'contacts',
  description: '联系人数据的缓存存储'
});

// 获取缓存配置
export const cacheConfig = {
  enabled: import.meta.env.VITE_CACHE_ENABLED !== 'false', // 默认启用
  maxAge: parseInt(import.meta.env.VITE_CACHE_MAX_AGE || 3600, 10), // 默认1小时(秒)
  messageCachePrefix: 'msg_',
  contactsCacheKey: 'contacts_data'
};

/**
 * 清理过期缓存
 * @returns {Promise<void>}
 */
export const clearExpiredCache = async () => {
  try {
    console.log('[Cache] 开始清理过期缓存...');

    // 获取所有消息缓存键
    const messageKeys = await messageCache.keys();
    
    const now = Date.now();
    let clearedCount = 0;
    
    // 检查每个缓存项是否过期
    for (const key of messageKeys) {
      try {
        const cacheData = await messageCache.getItem(key);
        if (cacheData && cacheData.expiration && cacheData.expiration < now) {
          await messageCache.removeItem(key);
          clearedCount++;
        }
      } catch (err) {
        console.warn(`[Cache] 处理缓存键 ${key} 时出错:`, err);
      }
    }
    
    // 检查联系人缓存是否过期
    try {
      const contactsData = await contactsCache.getItem(cacheConfig.contactsCacheKey);
      if (contactsData && contactsData.expiration && contactsData.expiration < now) {
        await contactsCache.removeItem(cacheConfig.contactsCacheKey);
        clearedCount++;
      }
    } catch (err) {
      console.warn('[Cache] 处理联系人缓存时出错:', err);
    }
    
    console.log(`[Cache] 清理了 ${clearedCount} 个过期缓存项`);
  } catch (error) {
    console.error('[Cache] 清理过期缓存时出错:', error);
  }
};

// 初始化时执行一次清理
clearExpiredCache().catch(err => {
  console.warn('[Cache] 初始化清理过期缓存时出错:', err);
});

export default {
  messageCache,
  contactsCache,
  cacheConfig,
  clearExpiredCache
}; 