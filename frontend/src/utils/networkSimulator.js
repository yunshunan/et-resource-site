/**
 * 网络模拟工具
 * 用于模拟各种网络条件下的API请求响应
 */

// 默认网络状态配置
let networkState = {
  // 是否模拟网络环境
  enabled: false,
  // 延迟时间范围(ms)
  delayRange: [200, 1000],
  // 失败率(0-1)
  failureRate: 0,
  // 超时概率(0-1)
  timeoutRate: 0,
  // 超时时间(ms)
  timeoutDuration: 5000,
  // 网络状态
  online: true
};

/**
 * 配置网络模拟器
 * @param {Object} config 网络状态配置
 */
export function configureNetworkSimulator(config) {
  networkState = { ...networkState, ...config };
  console.log('网络模拟器配置更新:', networkState);
  return networkState;
}

/**
 * 启用/禁用网络模拟器
 * @param {boolean} enabled 是否启用
 */
export function enableNetworkSimulator(enabled = true) {
  networkState.enabled = enabled;
  return networkState;
}

/**
 * 设置网络离线状态
 * @param {boolean} online 是否在线
 */
export function setOnlineStatus(online = true) {
  networkState.online = online;
  return networkState;
}

/**
 * 网络请求包装函数，添加网络模拟逻辑
 * @param {Function} apiCall API调用函数
 * @param {string} errorMessage 错误消息
 * @returns {Promise<any>} 请求结果
 */
export async function simulatedApiCall(apiCall, errorMessage = '网络请求失败') {
  // 不启用模拟器时，直接调用API
  if (!networkState.enabled) {
    return apiCall();
  }

  // 模拟离线状态
  if (!networkState.online) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('网络连接断开，请检查您的网络设置'));
      }, 500);
    });
  }

  // 计算随机延迟时间
  const [min, max] = networkState.delayRange;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;

  // 模拟请求延迟
  await new Promise(resolve => setTimeout(resolve, delay));

  // 模拟请求失败
  if (Math.random() < networkState.failureRate) {
    throw new Error(`${errorMessage} (HTTP 500)`);
  }

  // 模拟请求超时
  if (Math.random() < networkState.timeoutRate) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${errorMessage}: 请求超时`));
      }, networkState.timeoutDuration);
    });
  }

  // 正常调用API
  return apiCall();
}

/**
 * 模拟Axios请求，用于拦截器
 * @param {Object} config Axios请求配置
 * @returns {Promise<Object>} 处理后的请求配置
 */
export async function simulateApiCall(config) {
  // 不启用模拟器时，直接返回配置
  if (!networkState.enabled) {
    return config;
  }

  // 模拟离线状态
  if (!networkState.online) {
    return Promise.reject(new Error('网络连接断开，请检查您的网络设置'));
  }

  // 计算随机延迟时间
  const [min, max] = networkState.delayRange;
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;

  // 模拟请求延迟
  await new Promise(resolve => setTimeout(resolve, delay));

  // 模拟请求失败
  if (Math.random() < networkState.failureRate) {
    return Promise.reject(new Error(`请求失败 (HTTP 500)`));
  }

  // 模拟请求超时
  if (Math.random() < networkState.timeoutRate) {
    config.timeout = 1; // 设置一个极小的超时值触发超时错误
  }

  // 正常返回配置
  return config;
}

/**
 * 获取当前网络状态
 * @returns {Object} 当前网络状态
 */
export function getNetworkState() {
  return { ...networkState };
}

/**
 * 设置弱网络环境
 */
export function setWeakNetworkCondition() {
  return configureNetworkSimulator({
    enabled: true,
    delayRange: [800, 3000],
    failureRate: 0.2,
    timeoutRate: 0.1
  });
}

/**
 * 设置强网络环境
 */
export function setStrongNetworkCondition() {
  return configureNetworkSimulator({
    enabled: true,
    delayRange: [50, 300],
    failureRate: 0.05,
    timeoutRate: 0.01
  });
}

/**
 * 重置为默认网络环境
 */
export function resetNetworkCondition() {
  return configureNetworkSimulator({
    enabled: false,
    delayRange: [200, 1000],
    failureRate: 0,
    timeoutRate: 0,
    timeoutDuration: 5000,
    online: true
  });
}

// 导出网络模拟工具
export default {
  configureNetworkSimulator,
  enableNetworkSimulator,
  setOnlineStatus,
  simulatedApiCall,
  simulateApiCall,
  getNetworkState,
  setWeakNetworkCondition,
  setStrongNetworkCondition,
  resetNetworkCondition
}; 