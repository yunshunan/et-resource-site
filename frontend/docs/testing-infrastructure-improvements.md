# 测试基础设施改进

## 简介

本文档记录了对测试基础设施进行的改进，以提高测试可靠性、可维护性和开发体验。主要改进包括:

1. MSW (Mock Service Worker) 集成，用于可靠的API模拟
2. 优化测试日志输出，减少干扰
3. 解决macOS隐藏文件问题
4. 增强测试覆盖率计算

## MSW集成

### 问题描述

以前的测试依赖于直接mock axios，这种方式有几个问题:
1. 每个测试文件中重复mock逻辑
2. 难以模拟复杂场景(如网络错误)
3. 与实际HTTP行为差异较大

### 解决方案

集成MSW (Mock Service Worker)作为API模拟层:

1. 创建了专用的MSW服务器配置(`__tests__/msw/server.js`)
2. 实现了针对不同API的处理程序:
   - 认证API(`__tests__/msw/handlers/auth.js`)
   - 资源API(`__tests__/msw/handlers/resources.js`)
3. 提供了处理网络错误和服务器错误的辅助函数

### 使用示例

```js
// 导入MSW服务器和处理函数
import { server, createNetworkErrorHandler } from '../msw/server';

// 在测试中使用
it('处理网络错误', async () => {
  // 添加网络错误处理程序
  server.use(createNetworkErrorHandler('get', '/api/resources'));
  
  // 测试网络错误处理
  try {
    await axios.get('/api/resources');
    fail('应该抛出错误');
  } catch (error) {
    expect(error.message).toContain('Network Error');
  }
});
```

## 日志优化

### 问题描述

测试运行时生成大量日志输出，特别是模拟API错误时。这些日志:
1. 干扰真正重要的测试消息
2. 降低测试可读性
3. 使CI环境日志难以分析

### 解决方案

实现了两层日志过滤机制:

1. **通用JavaScript拦截器**(`scripts/logFilter.js`):
   - 拦截console.log、console.error等方法
   - 基于正则表达式过滤不相关消息

2. **Vitest特定过滤器**(`scripts/vitestLogFilter.js`):
   - 通过Vitest的onConsoleLog配置过滤
   - 能够识别测试来源，提供更精确的过滤

### 使用方式

```js
// vitest.config.js
import { filterTestLog } from './scripts/vitestLogFilter.js';

export default defineConfig({
  test: {
    // ...
    onConsoleLog(log, type, options) {
      return filterTestLog(log, getLogSource(options), type);
    }
  }
});
```

## macOS隐藏文件问题

### 问题描述

在macOS系统上，特别是通过文件管理器复制文件时，可能会生成以"._"开头的隐藏文件。这些文件:
1. 会被Git识别但通常会被忽略
2. 在测试运行时会被识别为测试文件，导致测试失败
3. 难以手动发现和删除

### 解决方案

实现了多层防御机制:

1. **预处理清理脚本**:
   - 添加了npm pretest脚本自动清理隐藏文件
   - 在每次测试运行前执行，确保干净的测试环境

2. **.gitignore更新**:
   - 添加了`._*`规则到.gitignore文件
   - 防止隐藏文件被意外提交到代码库

3. **CI流程优化**:
   - 在CI环境中增加文件检查步骤
   - 确保持续集成过程中没有隐藏文件干扰

### 实现细节

package.json中的相关脚本:
```json
{
  "scripts": {
    "clean:hidden": "find ./__tests__ -name '._*' -type f -delete",
    "pretest": "npm run clean:hidden",
    "pretest:unit": "npm run clean:hidden",
    "pretest:coverage": "npm run clean:hidden"
  }
}
```

## 测试覆盖率增强

### 问题描述

原有的测试覆盖率计算有一些局限性:
1. 分支覆盖率相对较低
2. 一些边界条件未被测试
3. 代码中的防御性检查缺乏测试

### 解决方案

1. **专项分支覆盖测试**:
   - 为重点模块编写了专门的分支覆盖测试文件
   - 例如: `auth.store.branch.spec.js`, `resources.store.branch.spec.js`

2. **空值处理测试**:
   - 添加了针对null/undefined处理的测试
   - 覆盖了边界条件和防御性代码路径

3. **覆盖阈值配置**:
   - 在vitest.config.js中设置了覆盖率阈值
   - 确保关键指标达到预期水平

### 覆盖率目标

| 指标 | 目标 | 当前 |
|------|-----|------|
| 语句覆盖率 | 80% | 95.53% |
| 分支覆盖率 | 75% | 77.95% |
| 函数覆盖率 | 80% | 84.84% |
| 行覆盖率 | 80% | 92.68% |

## 结论与后续改进

通过这些改进，我们显著提高了测试的:
- **可靠性**: 减少了由于外部因素导致的测试失败
- **可维护性**: 模块化的测试代码更易于维护
- **开发体验**: 更清晰的测试输出和更快的运行速度

### 未来计划

1. 进一步提高分支覆盖率
2. 添加更多集成测试
3. 优化测试运行速度
4. 增强测试文档 