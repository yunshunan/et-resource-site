/**
 * 性能数据同步服务
 * 负责将性能数据同步到服务器
 */

import * as notificationService from './notificationService';

// 同步配置
const syncConfig = {
  enabled: true,
  // 同步间隔（分钟）
  interval: 5,
  // 批量大小
  batchSize: 100,
  // 重试次数
  maxRetries: 3,
  // 重试延迟（秒）
  retryDelay: 30,
  // 同步端点
  endpoint: '/api/performance/metrics'
};

// 同步队列
let syncQueue = [];
// 上次同步时间
let lastSyncTime = 0;
// 同步锁
let isSyncing = false;

/**
 * 配置同步服务
 * @param {Object} config 同步配置
 */
export function configureSyncService(config) {
  Object.assign(syncConfig, config);
}

/**
 * 添加性能数据到同步队列
 * @param {Object} data 性能数据
 */
export function queuePerformanceData(data) {
  if (!syncConfig.enabled) return;
  
  syncQueue.push({
    ...data,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
  
  // 如果队列达到批量大小，触发同步
  if (syncQueue.length >= syncConfig.batchSize) {
    triggerSync();
  }
}

/**
 * 触发数据同步
 */
async function triggerSync() {
  if (!syncConfig.enabled || isSyncing) return;
  
  const now = Date.now();
  const timeSinceLastSync = now - lastSyncTime;
  
  // 检查是否达到同步间隔
  if (timeSinceLastSync < syncConfig.interval * 60 * 1000) return;
  
  try {
    isSyncing = true;
    await syncData();
    lastSyncTime = now;
  } catch (error) {
    console.error('性能数据同步失败:', error);
    notificationService.sendCustomNotification(
      'warning',
      '性能数据同步失败',
      '无法将性能数据同步到服务器',
      { error: error.message }
    );
  } finally {
    isSyncing = false;
  }
}

/**
 * 同步数据到服务器
 */
async function syncData(retryCount = 0) {
  if (syncQueue.length === 0) return;
  
  // 准备要同步的数据批次
  const batch = syncQueue.slice(0, syncConfig.batchSize);
  
  try {
    const response = await fetch(syncConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: batch,
        timestamp: Date.now()
      })
    });
    
    if (!response.ok) {
      throw new Error(`同步失败: ${response.status}`);
    }
    
    // 同步成功，从队列中移除已同步的数据
    syncQueue = syncQueue.slice(batch.length);
    
    // 如果队列中还有数据，继续同步
    if (syncQueue.length > 0) {
      await syncData();
    }
  } catch (error) {
    // 如果还有重试机会，等待后重试
    if (retryCount < syncConfig.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, syncConfig.retryDelay * 1000));
      await syncData(retryCount + 1);
    } else {
      throw error;
    }
  }
}

/**
 * 获取同步状态
 * @returns {Object} 同步状态信息
 */
export function getSyncStatus() {
  return {
    enabled: syncConfig.enabled,
    queueSize: syncQueue.length,
    lastSyncTime,
    isSyncing
  };
}

/**
 * 启动同步服务
 */
export function startSyncService() {
  if (!syncConfig.enabled) return;
  
  // 定期检查并同步数据
  setInterval(() => {
    if (syncQueue.length > 0) {
      triggerSync();
    }
  }, syncConfig.interval * 60 * 1000);
  
  // 页面卸载前尝试同步剩余数据
  window.addEventListener('beforeunload', () => {
    if (syncQueue.length > 0) {
      // 使用 sendBeacon API 确保数据发送
      navigator.sendBeacon(syncConfig.endpoint, JSON.stringify({
        metrics: syncQueue,
        timestamp: Date.now()
      }));
    }
  });
}

export default {
  configureSyncService,
  queuePerformanceData,
  getSyncStatus,
  startSyncService
}; 