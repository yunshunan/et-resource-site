# Et资源小站测试标准

本文档定义了Et资源小站前端项目的测试标准、最佳实践和开发流程。

## 测试类型

项目包含以下类型的测试：

1. **单元测试（Unit Tests）**：测试独立组件和服务的功能，使用Vitest运行
2. **集成测试（Integration Tests）**：测试多个组件或服务间的交互，使用Vitest运行
3. **端到端测试（E2E Tests）**：模拟真实用户行为的测试，使用Cypress运行

## 覆盖率目标

项目设定了以下覆盖率目标：

- 语句覆盖率（Statements）: 80%
- 分支覆盖率（Branches）: 75%
- 函数覆盖率（Functions）: 80%
- 行覆盖率（Lines）: 80%

这些目标在CI流程中会自动校验，未达到要求的PR将无法合并。

## 测试文件命名规范

- 单元测试: `*.spec.js`
- 集成测试: `*.integration.spec.js`
- 端到端测试: `*.cy.js`

## 测试文件位置

- 单元测试和集成测试位于`__tests__`目录
- 端到端测试位于`cypress/e2e`目录

## 测试命令

以下是常用的测试命令：

```bash
# 运行所有测试
npm run test:all

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 覆盖率报告
npm run test:coverage

# 特定模块覆盖率
npm run test:coverage:auth
npm run test:coverage:resources

# 端到端测试
npm run test:e2e
```

## 模拟（Mocking）标准

### API模拟

使用`vi.mock`来模拟API服务，必须在导入服务之前进行模拟：

```javascript
// 模拟API必须在导入存储前定义
vi.mock('../src/services/api', async () => {
  // 创建模拟API函数
  const mockFunction = vi.fn();
  
  return {
    apiService: {
      someMethod: mockFunction
    }
  };
});

// 在模拟之后导入
import { apiService } from '../src/services/api';
```

### 浏览器API模拟

对于`localStorage`、`fetch`等浏览器API，使用`vi.fn()`创建模拟：

```javascript
// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## 测试结构

测试文件应该遵循以下结构：

```javascript
// 导入测试库
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// 导入被测试的组件/服务
import { someFunction } from './path/to/module';

describe('组件名称', () => {
  // 在每个测试前执行
  beforeEach(() => {
    // 设置测试环境
  });

  // 在每个测试后执行
  afterEach(() => {
    // 清理测试环境
    vi.resetAllMocks();
  });

  // 测试用例
  it('应该执行某个功能', () => {
    // 准备
    const input = '...';
    
    // 执行
    const result = someFunction(input);
    
    // 断言
    expect(result).toBe('expected value');
  });
});
```

## 测试隔离原则

1. 测试不应该依赖于其他测试的执行结果
2. 测试不应该对外部系统产生副作用
3. 测试应该能够并行运行而不相互干扰

## 端到端测试最佳实践

1. 创建独立测试用户和测试数据
2. 使用Cypress命令封装常见操作
3. 使用数据属性（`data-testid`）而非CSS选择器来定位元素
4. 测试关键用户流程而非所有可能的路径

```javascript
// 推荐的E2E测试示例
describe('资源浏览', () => {
  beforeEach(() => {
    cy.login('testuser', 'password');
    cy.visit('/resources');
  });

  it('应该能够成功加载资源列表', () => {
    cy.get('[data-testid="resource-list"]').should('be.visible');
    cy.get('[data-testid="resource-item"]').should('have.length.at.least', 1);
  });
});
```

## 异步测试标准

对于包含异步操作的测试，使用`async/await`语法，确保测试等待异步操作完成：

```javascript
it('应该异步加载数据', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

## 时间相关测试

使用Vitest的计时器模拟功能来测试时间相关代码：

```javascript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('应该在指定时间后执行回调', async () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);
  
  await vi.advanceTimersByTimeAsync(1000);
  expect(callback).toHaveBeenCalled();
});
```

## 持续集成

所有测试将在GitHub Actions中自动运行，确保代码质量。CI流程包括：

1. 运行单元测试和集成测试
2. 检查代码覆盖率
3. 运行E2E测试
4. 代码质量检查

## 测试问题解决

对于常见的测试问题：

1. **测试失败**：首先检查最近的代码更改，确保测试环境正确设置
2. **覆盖率不足**：审查未覆盖的代码路径，添加相应测试
3. **测试超时**：检查测试中的异步操作是否正确处理
4. **间歇性失败**：寻找可能的竞态条件或共享状态

## 测试代码审查清单

审查测试代码时，确认：

- [ ] 测试覆盖所有关键功能和边缘情况
- [ ] 测试独立且不依赖其他测试
- [ ] 断言语句明确且有意义
- [ ] 没有多余或重复的测试
- [ ] 模拟和存根使用正确
- [ ] 异步操作正确处理
- [ ] 清理代码适当放置在`afterEach`或`afterAll`中

## 测试更新流程

1. 当业务逻辑变更时，相应的测试必须更新
2. 在重构代码前，确保有足够的测试覆盖率
3. 测试文件的变更必须经过至少一人的代码审查 