# 测试基础设施改进

本文档详细说明了对测试基础设施的改进，以提高测试稳定性和可维护性。

## 改进内容

### 1. macOS隐藏文件问题解决

为解决macOS系统创建的隐藏文件（以`._`开头）在测试运行中造成的问题，我们实现了以下解决方案：

- **更新`.gitignore`文件**：添加了`._*`模式以忽略所有macOS隐藏文件，防止它们被意外提交到代码库。
- **添加预处理脚本**：在`package.json`中添加了`pretest`脚本，它会在测试运行前自动删除测试目录中的所有隐藏文件。

```json
"scripts": {
  "pretest": "find __tests__ -name '._*' -type f -delete || true",
  "test": "vitest run",
  // ...
}
```

### 2. 测试日志优化

为减少测试输出中的干扰信息，特别是模拟网络错误产生的大量日志，我们实现了：

- **Vitest配置优化**：在`vitest.config.js`中添加了`onConsoleLog`处理函数，过滤掉已知的错误消息。
- **控制台日志拦截**：在`vitest.setup.js`中添加了对`console.error`的拦截，忽略常见的网络错误和401状态码错误。

这些改进使测试输出更加清晰，便于识别真正的问题。

### 3. API测试分解与改进

为提高API测试的稳定性：

- **使用MSW模拟服务**：创建了专用的MSW处理程序（`apiServiceMock`），用于可靠地模拟各种HTTP响应和错误情况。
- **测试隔离**：将API测试分解成更小、更专注的测试文件，使测试更加稳定和可维护。
- **可重用测试辅助函数**：封装了常见的测试操作，如模拟成功响应、错误响应、网络错误等。

## 使用指南

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试（如认证测试）
npm run test:coverage:auth

# 带覆盖率报告运行所有测试
npm run test:coverage
```

### 模拟API响应

在测试中使用MSW模拟API响应：

```javascript
import { server, apiServiceMock } from '../msw/server';

// 模拟成功响应
apiServiceMock.mockRequestSuccess('GET', '/endpoint', { data: 'test' });

// 模拟错误响应
apiServiceMock.mockRequestFailure('POST', '/endpoint', 500, 'Server Error');

// 模拟网络错误
apiServiceMock.mockNetworkError('GET', '/endpoint');
```

## 最佳实践

1. **使用MSW而非原始Axios模拟**：MSW提供更接近真实网络请求的模拟体验。
2. **隔离测试**：避免测试之间的依赖，每个测试应该是独立的。
3. **清理模拟**：每个测试后使用`afterEach`钩子清理模拟。
4. **适当使用模拟**：仅模拟必要的外部依赖，保持测试的真实性。

## 后续计划

1. 完善MSW处理程序，覆盖更多API场景。
2. 添加更多端到端测试，验证整个应用流程。
3. 持续优化测试速度和稳定性。 