// 导入vitest的API
import { vi, afterAll, beforeAll, afterEach } from 'vitest';
// 导入MSW服务器
import { server } from './__tests__/msw/server';
// 导入日志过滤器
import { installConsoleInterceptors, restoreConsole } from './scripts/logFilter.js';

// 模拟localStorage
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }
}

// 设置localStorage模拟
global.localStorage = new LocalStorageMock()

// 设置sessionStorage模拟
global.sessionStorage = new LocalStorageMock()

// 添加对象监控，用于测试持久化
global.__storageSetSpy = vi.fn()
const originalSetItem = global.localStorage.setItem
global.localStorage.setItem = function(key, value) {
  global.__storageSetSpy(key, value)
  return originalSetItem.apply(this, arguments)
}

// 安装日志拦截器 - 减少测试输出噪音
installConsoleInterceptors();

// 在测试完成后恢复console
afterAll(() => {
  restoreConsole();
});

// 设置MSW服务器
beforeAll(() => {
  // 启动MSW监听
  server.listen({ onUnhandledRequest: 'bypass' });
  console.log('🔶 MSW服务器已启动');
});

// 每个测试之间重置处理程序
afterEach(() => {
  server.resetHandlers();
});

// 测试完成后关闭服务器
afterAll(() => {
  server.close();
  console.log('🔶 MSW服务器已关闭');
}, { timeout: 500 }); 