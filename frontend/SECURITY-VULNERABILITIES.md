# 安全漏洞记录

本文档记录了在项目依赖中发现的安全漏洞，以便后续处理。

## 发现日期：2025-04-09

## 中等严重性漏洞（共11个）：

### 1. esbuild 漏洞
- **严重性**: 中等
- **描述**: esbuild 允许任何网站向开发服务器发送请求并读取响应
- **漏洞链接**: https://github.com/advisories/GHSA-67mh-4wv8-2f99
- **受影响的组件**: 
  - esbuild
  - vite (依赖于受漏洞影响的 esbuild 版本)
  - @vitejs/plugin-vue (依赖于受漏洞影响的 vite 版本)
  - vite-node (依赖于受漏洞影响的 vite 版本)
  - vitest (依赖于受漏洞影响的 vite 和 vite-node 版本)
  - @vitest/coverage-v8 (依赖于受漏洞影响的 vitest 版本)
- **修复方案**: 
  - 通过 `npm audit fix --force` 升级 vite 到 6.2.5（注意：这是一个重大更改）
  - 风险评估：由于这主要影响开发服务器，生产环境风险较低

### 2. micromatch 漏洞
- **严重性**: 中等
- **描述**: micromatch 中的正则表达式拒绝服务 (ReDoS) 漏洞
- **漏洞链接**: https://github.com/advisories/GHSA-952p-6rrq-rcjv
- **受影响的组件**: 
  - micromatch
  - lint-staged (依赖于受漏洞影响的 micromatch 版本)
- **修复方案**: 
  - 通过 `npm audit fix` 升级 micromatch
  - 或升级 lint-staged 到最新版本

### 3. vue-template-compiler 漏洞
- **严重性**: 中等
- **描述**: vue-template-compiler 客户端跨站脚本 (XSS) 漏洞
- **漏洞链接**: https://github.com/advisories/GHSA-g3ch-rx76-35fx
- **受影响的组件**: 
  - vue-template-compiler
  - @vue/language-core (依赖于受漏洞影响的 vue-template-compiler 版本)
  - vue-tsc (依赖于受漏洞影响的 @vue/language-core 版本)
- **修复方案**: 
  - 通过 `npm audit fix --force` 降级 vue-template-compiler 到 0.1.0（注意：这是一个重大更改）
  - 风险缓解：实施内容安全策略 (CSP) 来减轻 XSS 风险

## 安全升级计划：

计划在项目开发稳定后，安排一个专门的"安全升级"迭代，解决这些漏洞。在此之前，将采取以下措施来缓解潜在风险：

1. 开发环境中不要将开发服务器暴露在公共网络中
2. 在生产环境中实施内容安全策略 (CSP)
3. 定期检查是否有更新的补丁可用
4. 对用户输入进行严格验证和清理，防止 XSS 攻击

## 修复记录：

| 日期 | 漏洞 | 修复方案 | 状态 |
|------|------|---------|------|
| - | - | - | 未修复 | 