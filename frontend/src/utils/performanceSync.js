/**
 * 性能同步工具
 * 用于将性能数据同步到服务器
 */

// 导入API服务
import api from '@/services/api'

// 同步队列
let syncQueue = [];

// 同步状态
let syncStatus = {
  running: false,
  lastSync: null,
  error: null
};

// 同步间隔
const SYNC_INTERVAL = 5 * 60 * 1000; // 5分钟

/**
 * 添加性能数据到同步队列
 * @param {Object} data 性能数据
 */
export function queuePerformanceData(data) {
  syncQueue.push({
    ...data,
    clientTimestamp: Date.now()
  });
  
  // 限制队列长度，防止内存溢出
  if (syncQueue.length > 100) {
    syncQueue = syncQueue.slice(-100);
  }
  
  return true;
}

/**
 * 同步性能数据到服务器
 * @returns {Promise<boolean>} 是否同步成功
 */
export async function syncPerformanceData() {
  // 如果队列为空，无需同步
  if (syncQueue.length === 0) {
    return true;
  }
  
  // 如果正在同步，跳过
  if (syncStatus.running) {
    return false;
  }
  
  try {
    // 设置同步状态
    syncStatus.running = true;
    syncStatus.error = null;
    
    // 克隆队列数据，以便同步过程中新数据仍可添加到队列
    const dataToSync = [...syncQueue];
    
    // 调用API同步数据
    if (process.env.NODE_ENV !== 'production') {
      // 开发环境下模拟同步
      console.log(`[Performance] 模拟同步 ${dataToSync.length} 条性能数据`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // 生产环境下实际同步
      await api.post('/performance', { 
        data: dataToSync 
      });
    }
    
    // 同步成功，清空已同步的数据
    syncQueue = syncQueue.slice(dataToSync.length);
    
    // 更新同步状态
    syncStatus.lastSync = Date.now();
    syncStatus.running = false;
    
    return true;
  } catch (error) {
    // 同步失败，更新状态
    syncStatus.error = {
      message: error.message,
      timestamp: Date.now()
    };
    syncStatus.running = false;
    
    console.error('[Performance] 同步性能数据失败:', error);
    return false;
  }
}

/**
 * 开始性能数据同步服务
 */
export function startSyncService() {
  // 定期同步性能数据
  setInterval(async () => {
    // 如果队列不为空，尝试同步
    if (syncQueue.length > 0) {
      await syncPerformanceData();
    }
  }, SYNC_INTERVAL);
  
  // 页面卸载前尝试同步
  window.addEventListener('beforeunload', () => {
    // 使用同步请求，确保数据在页面关闭前发送
    if (syncQueue.length > 0 && navigator.sendBeacon) {
      const data = JSON.stringify(syncQueue);
      navigator.sendBeacon('/api/performance', data);
    }
  });
  
  return true;
}

/**
 * 获取同步状态
 * @returns {Object} 同步状态
 */
export function getSyncStatus() {
  return {
    ...syncStatus,
    queueLength: syncQueue.length
  };
}

/**
 * 手动触发同步
 * @returns {Promise<boolean>} 是否同步成功
 */
export async function forceSyncPerformanceData() {
  return syncPerformanceData();
}

// 导出性能同步工具
export default {
  queuePerformanceData,
  syncPerformanceData,
  startSyncService,
  getSyncStatus,
  forceSyncPerformanceData
}; 