/**
 * 日志过滤器
 * 用于过滤掉测试过程中不必要的控制台输出
 */

// 保存原始的控制台方法
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// 需要过滤的日志模式
const filterPatterns = [
  /\[MSW\]/,
  /Network Error/i,
  /Request failed with status code/,
  /axios/i,
  /XMLHttpRequest/
];

/**
 * 检查消息是否应该被过滤
 * @param {any[]} args - 控制台方法的参数
 * @returns {boolean} - 是否应该过滤
 */
function shouldFilter(args) {
  // 将参数转换为字符串进行匹配
  const message = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.message;
    return JSON.stringify(arg);
  }).join(' ');
  
  // 检查是否匹配任何过滤模式
  return filterPatterns.some(pattern => pattern.test(message));
}

/**
 * 安装控制台拦截器
 */
function installConsoleInterceptors() {
  // 拦截console.log
  console.log = function(...args) {
    if (!shouldFilter(args)) {
      originalConsole.log(...args);
    }
  };
  
  // 拦截console.warn
  console.warn = function(...args) {
    if (!shouldFilter(args)) {
      originalConsole.warn(...args);
    }
  };
  
  // 拦截console.error
  console.error = function(...args) {
    if (!shouldFilter(args)) {
      originalConsole.error(...args);
    }
  };
  
  // 拦截console.info
  console.info = function(...args) {
    if (!shouldFilter(args)) {
      originalConsole.info(...args);
    }
  };
  
  // 拦截console.debug
  console.debug = function(...args) {
    if (!shouldFilter(args)) {
      originalConsole.debug(...args);
    }
  };
}

/**
 * 恢复原始控制台方法
 */
function restoreConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
}

/**
 * 添加过滤模式
 * @param {RegExp} pattern - 要添加的正则表达式模式
 */
function addFilterPattern(pattern) {
  if (pattern instanceof RegExp) {
    filterPatterns.push(pattern);
  } else if (typeof pattern === 'string') {
    filterPatterns.push(new RegExp(pattern, 'i'));
  }
}

module.exports = {
  installConsoleInterceptors,
  restoreConsole,
  addFilterPattern,
  filterPatterns
}; 