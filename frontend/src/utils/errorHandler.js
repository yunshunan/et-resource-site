/**
 * 通用错误处理工具
 * 用于统一处理API错误
 */

/**
 * 从错误对象中提取错误消息
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 格式化后的错误消息
 */
export function extractErrorMessage(error, defaultMessage = '操作失败，请稍后再试') {
  // 如果是Axios错误对象，尝试从response中提取错误消息
  if (error.response && error.response.data) {
    const { data } = error.response;
    return data.message || data.error || defaultMessage;
  }
  
  // 如果有消息属性，直接返回
  if (error.message) {
    return error.message;
  }
  
  // 如果是字符串，直接返回
  if (typeof error === 'string') {
    return error;
  }
  
  // 默认返回通用错误消息
  return defaultMessage;
}

/**
 * 统一处理API响应
 * @param {Object} response - API响应对象
 * @param {string} errorMessage - 错误消息
 * @returns {Object} 处理后的数据对象
 * @throws {Error} 如果响应不成功，抛出错误
 */
export function handleApiResponse(response, errorMessage) {
  // 检查响应是否存在
  if (!response) {
    throw new Error(errorMessage);
  }
  
  // 检查响应是否成功
  if (response.success || response.data) {
    return response.data || response;
  }
  
  // 抛出错误
  throw new Error(response.message || errorMessage);
}

/**
 * 包装API调用，统一处理错误
 * @param {Function} apiCall - API调用函数
 * @param {Object} store - 存储对象，用于设置loading和error状态
 * @param {string} errorMessage - 错误消息
 * @returns {Promise} API调用结果
 */
export async function wrapApiCall(apiCall, store, errorMessage) {
  // 如果store存在，设置loading状态
  if (store) {
    store.loading = true;
    store.error = null;
  }
  
  try {
    // 执行API调用
    const response = await apiCall();
    
    // 处理响应
    return handleApiResponse(response, errorMessage);
  } catch (error) {
    // 处理错误
    console.error(`${errorMessage}:`, error);
    
    // 如果store存在，设置error状态
    if (store) {
      store.error = extractErrorMessage(error, errorMessage);
    }
    
    // 重新抛出格式化的错误
    throw new Error(extractErrorMessage(error, errorMessage));
  } finally {
    // 如果store存在，重置loading状态
    if (store) {
      store.loading = false;
    }
  }
}

export default {
  extractErrorMessage,
  handleApiResponse,
  wrapApiCall
}; 