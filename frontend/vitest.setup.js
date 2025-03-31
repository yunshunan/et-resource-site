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