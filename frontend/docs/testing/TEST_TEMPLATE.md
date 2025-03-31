# 测试模板

以下是基于`auth.store.spec.js`的测试模板，可作为编写新测试的参考框架。

## 存储（Store）测试模板

```javascript
/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// 导入模拟响应（推荐放在单独的文件中）
import { 
  mockSuccessResponse, 
  mockFailureResponse
} from './mock/apiMock';

// 重要：模拟API必须在导入存储前定义
vi.mock('../src/services/api', async () => {
  // 创建模拟API函数
  const mockApiMethod = vi.fn();
  
  return {
    // 返回与真实API结构相同的模拟对象
    apiService: {
      someMethod: mockApiMethod
    }
  };
});

// 导入必须在模拟之后
import { useYourStore } from '../src/stores/your-store';
import { apiService } from '../src/services/api';

describe('Your Store', () => {
  let store;

  beforeEach(() => {
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia());
    
    // 获取store实例
    store = useYourStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });

  // 测试初始状态
  it('初始状态应该正确设置', () => {
    expect(store.someState).toBe(expectedInitialValue);
    // 添加更多初始状态断言...
  });

  // 测试成功场景
  it('操作成功时应正确更新状态', async () => {
    // 设置模拟函数的返回值
    apiService.someMethod.mockResolvedValue(mockSuccessResponse);
    
    // 执行操作
    const result = await store.someAction(param1, param2);
    
    // 验证API被调用
    expect(apiService.someMethod).toHaveBeenCalledWith({
      param1,
      param2
    });
    
    // 验证结果
    expect(result).toBe(expectedValue);
    expect(store.someState).toEqual(expectedNewState);
    // 添加更多状态断言...
  });

  // 测试失败场景
  it('操作失败时应设置错误信息', async () => {
    // 设置模拟函数的返回值
    apiService.someMethod.mockResolvedValue(mockFailureResponse);
    
    // 执行操作
    const result = await store.someAction(param1, param2);
    
    // 验证结果
    expect(result).toBe(false); // 或其他表示失败的值
    expect(store.error).toBe(mockFailureResponse.message);
    // 添加更多状态断言...
  });

  // 测试网络错误处理
  it('网络错误时应正确处理', async () => {
    // 模拟网络错误
    const networkError = new Error('Network Error');
    apiService.someMethod.mockRejectedValue(networkError);
    
    // 执行操作
    await store.someAction(param1, param2);
    
    // 验证错误处理
    expect(store.error).toBe('Network Error');
    // 添加更多状态断言...
  });
});
```

## 持久化存储测试模板

对于使用持久化存储(如localStorage)的Store，添加以下测试：

```javascript
describe('Store 持久化', () => {
  let store;
  const STORAGE_KEY = 'your-storage-key';

  beforeEach(() => {
    // 设置模拟计时器
    vi.useFakeTimers();
    
    // 清空localStorage
    localStorage.clear();
    
    // 创建一个新的Pinia实例并使其处于激活状态
    setActivePinia(createPinia());
    
    // 获取store实例
    store = useYourStore();
    
    // 重置所有模拟函数
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复真实计时器
    vi.useRealTimers();
  });

  it('操作后应正确更新状态', async () => {
    // 设置模拟函数的返回值
    apiService.someMethod.mockResolvedValue(mockSuccessResponse);
    
    // 执行操作
    await store.someAction(param1, param2);
    
    // 验证状态已正确设置
    expect(store.someState).toBe(expectedValue);
    // 添加更多状态断言...
  });

  it('localStorage不可用时应正常工作', async () => {
    // 备份原始方法
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    try {
      // 模拟localStorage不可用
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage不可用');
      });
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage不可用');
      });
      
      // 设置模拟函数的返回值
      apiService.someMethod.mockResolvedValue(mockSuccessResponse);
      
      // 执行操作应该不会因localStorage错误而失败
      const result = await store.someAction(param1, param2);
      
      // 验证操作成功
      expect(result).toBe(true);
      expect(store.someState).toBe(expectedValue);
    } finally {
      // 恢复原始方法
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    }
  });
});
```

## 组件测试模板

使用Vue Test Utils测试组件：

```javascript
/**
 * @vitest-environment jsdom
 */

import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import YourComponent from '../src/components/YourComponent.vue';

describe('YourComponent', () => {
  let wrapper;
  
  beforeEach(() => {
    // 设置Pinia
    setActivePinia(createPinia());
    
    // 挂载组件
    wrapper = mount(YourComponent, {
      props: {
        // 设置属性
        someProp: 'value'
      },
      global: {
        // 全局配置，如插件、指令等
      }
    });
  });

  it('应该正确渲染', () => {
    // 检查DOM元素是否存在
    expect(wrapper.find('.some-class').exists()).toBe(true);
    
    // 检查内容
    expect(wrapper.find('h1').text()).toBe('预期的标题');
  });

  it('点击按钮应触发事件', async () => {
    // 模拟点击
    await wrapper.find('button').trigger('click');
    
    // 验证事件
    expect(wrapper.emitted('some-event')).toBeTruthy();
    
    // 或验证状态变化
    expect(wrapper.find('.result').text()).toBe('点击后的结果');
  });
});
```

## 参考资源

- [Vitest 文档](https://vitest.dev/guide/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Pinia 测试指南](https://pinia.vuejs.org/cookbook/testing.html)
- [Cypress 文档](https://docs.cypress.io/) 