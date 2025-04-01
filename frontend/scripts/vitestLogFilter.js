/**
 * Vitest日志过滤器 (ESM格式)
 * 用于控制测试过程中的日志输出，提高可读性
 */

// 需要过滤的日志模式
const filterPatterns = [
  // 网络错误相关
  /Network Error/i,
  /Request failed with status code/i,
  /axios/i,
  /XMLHttpRequest/i,
  /401 Unauthorized/i,
  /ERR_NETWORK/i,
  /AxiosError/i,
  /API请求错误/i,
  /ETIMEDOUT/i,
  /ECONNREFUSED/i,
  /ECONNRESET/i,
  /ENOTFOUND/i,
  
  // MSW和测试相关
  /\[MSW\]/i,
  /MSW服务器/i,
  
  // 认证错误
  /token expired/i,
  /用户名或密码错误/i,
  /注销时发生错误/i,
  /刷新token失败/i,
  /认证失败/i,
  /jwt (expired|malformed|invalid)/i,
  
  // 资源模块错误
  /获取资源(列表|详情)失败/i,
  /(创建|更新|删除)资源失败/i,
  /操作收藏失败/i,
  /评分失败/i,
  /资源不存在/i,
  
  // 常见测试输出
  /Expected.*but received/i,
  /Cannot call.*during render/i
];

/**
 * 过滤测试日志
 * @param {string} log - 日志内容
 * @param {string} source - 日志来源
 * @param {string} type - 日志类型
 * @returns {boolean} 返回false表示过滤掉该日志
 */
export function filterTestLog(log, source = 'unknown', type = 'log') {
  // 检查是否匹配任何过滤模式
  const shouldFilter = filterPatterns.some(pattern => pattern.test(log));
  
  // 如果启用了DEBUG环境变量，则不过滤
  if (process.env.DEBUG === 'true') {
    return true;
  }
  
  // 返回false表示过滤该日志
  return !shouldFilter;
}

/**
 * 添加过滤模式
 * @param {RegExp} pattern - 要添加的正则表达式模式
 */
export function addFilterPattern(pattern) {
  if (pattern instanceof RegExp) {
    filterPatterns.push(pattern);
  } else if (typeof pattern === 'string') {
    filterPatterns.push(new RegExp(pattern, 'i'));
  }
}

// 导出过滤模式列表
export { filterPatterns };