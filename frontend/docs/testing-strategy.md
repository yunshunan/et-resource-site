# ET Resource Site 测试策略指南

## 目录

1. [测试原则](#测试原则)
2. [测试类型](#测试类型)
3. [测试覆盖率标准](#测试覆盖率标准)
4. [测试最佳实践](#测试最佳实践)
5. [模拟与夹具](#模拟与夹具)
6. [常见测试场景](#常见测试场景)
7. [故障排除](#故障排除)

## 测试原则

我们的测试策略基于以下核心原则：

1. **测试金字塔**：单元测试 > 集成测试 > E2E测试，数量依次递减
2. **独立性**：每个测试应该独立运行，不依赖于其他测试的状态
3. **确定性**：测试应该每次都产生相同的结果
4. **快速反馈**：测试套件应该快速运行，提供即时反馈
5. **可维护性**：测试代码应该像生产代码一样维护，保持清晰和简洁

## 测试类型

### 单元测试

单元测试用于测试最小的代码单元，通常是单个函数或组件。

**工具**：Vitest + Vue Test Utils

**文件命名**：`*.spec.js`

**目录**：`__tests__/`

**示例**：
```js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HelloWorld from '../components/HelloWorld.vue';

describe('HelloWorld.vue', () => {
  it('renders message correctly', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello Vitest' }
    });
    expect(wrapper.text()).toContain('Hello Vitest');
  });
});
```

### 集成测试

集成测试用于测试多个组件或服务之间的交互。

**工具**：Vitest + MSW(模拟API)

**文件命名**：`*.integration.spec.js`

**目录**：`__tests__/integration/`

**示例**：
```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mount } from '@vue/test-utils';
import UserProfile from '../components/UserProfile.vue';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John Doe' }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('UserProfile.vue', () => {
  it('loads and displays user data', async () => {
    const wrapper = mount(UserProfile);
    // 等待API请求完成
    await flushPromises();
    expect(wrapper.text()).toContain('John Doe');
  });
});
```

### 端到端测试

端到端测试用于测试整个应用程序的流程。

**工具**：Cypress

**文件命名**：`*.cy.js`

**目录**：`cypress/e2e/`

**示例**：
```js
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-test="username"]').type('testuser');
    cy.get('[data-test="password"]').type('password');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## 测试覆盖率标准

我们的项目设定了以下覆盖率目标：

| 类型 | 目标 | 最低要求 |
|------|------|----------|
| 语句覆盖率 | 95% | 90% |
| 分支覆盖率 | 85% | 65% |
| 函数覆盖率 | 90% | 75% |
| 行覆盖率 | 95% | 90% |

### 优先级

测试覆盖的优先级顺序：

1. 核心业务逻辑
2. 错误处理路径
3. 边缘情况
4. 用户界面交互

## 测试最佳实践

### 通用最佳实践

1. **测试一件事**：每个测试只测试一个行为或断言
2. **使用有意义的描述**：测试描述应该清晰表达测试的内容
3. **避免测试实现细节**：测试应该关注组件的行为而非实现方式
4. **使用数据测试属性**：使用`data-test`属性选择元素，而不是依赖CSS类或ID
5. **隔离测试环境**：每个测试前重置状态

### Store测试

1. 创建存储前设置Pinia实例：
```js
const pinia = createPinia();
setActivePinia(pinia);
```

2. 测试action、getter和状态变更：
```js
const store = useAuthStore();
await store.login({ username: 'test', password: 'password' });
expect(store.isLoggedIn).toBe(true);
```

### API服务测试

1. 模拟HTTP请求：
```js
import axios from 'axios';
vi.mock('axios');
axios.get.mockResolvedValue({ data: { users: [] } });
```

2. 测试错误处理：
```js
axios.get.mockRejectedValue(new Error('Network Error'));
try {
  await userApi.getUsers();
} catch (error) {
  expect(error.message).toBe('Network Error');
}
```

## 模拟与夹具

### 模拟

1. **依赖模拟**：使用`vi.mock()`模拟外部依赖
2. **函数模拟**：使用`vi.fn()`模拟函数
3. **时间模拟**：使用`vi.useFakeTimers()`模拟定时器

### 测试夹具

1. 在`__fixtures__/`目录中创建测试数据文件
2. 使用工厂函数创建测试数据：

```js
// __fixtures__/users.js
export const createUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

## 常见测试场景

### 认证流程测试

```js
it('登录成功应更新认证状态', async () => {
  const authStore = useAuthStore();
  // 模拟API响应
  apiMock.post.mockResolvedValueOnce({ 
    token: 'test-token', 
    user: { id: 1, name: 'User' } 
  });
  
  // 执行登录
  await authStore.login({ username: 'test', password: 'password' });
  
  // 验证状态
  expect(authStore.isLoggedIn).toBe(true);
  expect(authStore.user).toEqual({ id: 1, name: 'User' });
  expect(authStore.token).toBe('test-token');
});
```

### 错误处理测试

```js
it('应处理网络错误', async () => {
  const authStore = useAuthStore();
  const networkError = new Error('Network Error');
  
  // 模拟网络错误
  apiMock.post.mockRejectedValueOnce(networkError);
  
  // 执行操作
  try {
    await authStore.login({ username: 'test', password: 'password' });
  } catch (error) {
    expect(error).toBe(networkError);
    expect(authStore.error).toEqual('Network Error');
    expect(authStore.isLoading).toBe(false);
  }
});
```

### 边缘情况测试

```js
it('空用户应返回未认证状态', () => {
  const authStore = useAuthStore();
  authStore.user = null;
  
  expect(authStore.isLoggedIn).toBe(false);
  expect(authStore.isAdmin).toBe(false);
});
```

## 故障排除

### 常见问题

1. **测试环境问题**：确保在jsdom环境下运行：
```js
/**
 * @vitest-environment jsdom
 */
```

2. **异步测试超时**：增加超时时间：
```js
it('处理长时间运行的操作', { timeout: 10000 }, async () => {
  // 测试代码
});
```

3. **模拟模块问题**：确保在beforeEach中重置模块：
```js
beforeEach(() => {
  vi.resetModules();
});
```

4. **解决存根报错**：
```js
// 解决console.error被调用但未被模拟的问题
vi.spyOn(console, 'error').mockImplementation(() => {});
```

### 调试技巧

1. 使用`console.log`在测试中输出值
2. 查看测试覆盖率报告以找出未测试的区域
3. 使用`--update-snapshot`更新快照测试 