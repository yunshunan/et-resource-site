/**
 * ESLint配置检查工具
 * 
 * 这个脚本用于检查项目的ESLint配置是否正确，以及所需依赖是否齐全。
 * 执行此脚本可以快速诊断ESLint相关问题。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

// 所需依赖列表
const requiredDeps = [
  'eslint',
  'eslint-plugin-vue', 
  'vue-eslint-parser',
  '@babel/eslint-parser'
];

console.log('🔍 开始检查ESLint配置...\n');

// 1. 检查配置文件是否存在
console.log('步骤1: 检查配置文件');
const configPath = path.join(rootDir, '.eslintrc.js');
if (fs.existsSync(configPath)) {
  console.log('✅ 找到ESLint配置文件');
  
  // 显示配置内容摘要
  const config = require(configPath);
  console.log('📄 配置摘要:');
  console.log(`  - Parser: ${config.parser || '未指定'}`);
  console.log(`  - Extends: ${JSON.stringify(config.extends) || '未指定'}`);
  console.log(`  - Plugins: ${JSON.stringify(config.plugins) || '未指定'}`);
} else {
  console.log('❌ 未找到ESLint配置文件');
}

// 2. 检查依赖是否已安装
console.log('\n步骤2: 检查所需依赖');
const packageJsonPath = path.join(rootDir, 'package.json');
let missingDeps = [];

if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  
  for (const dep of requiredDeps) {
    if (allDeps[dep]) {
      console.log(`✅ ${dep} (${allDeps[dep]})`);
    } else {
      console.log(`❌ 缺少 ${dep}`);
      missingDeps.push(dep);
    }
  }
} else {
  console.log('❌ 未找到package.json文件');
  missingDeps = requiredDeps; // 假设所有依赖都缺失
}

// 3. 验证配置是否有效
console.log('\n步骤3: 验证配置有效性');
try {
  // 创建测试文件
  const testFilePath = path.join(rootDir, 'eslint-test-temp.vue');
  fs.writeFileSync(testFilePath, `<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World'
    }
  }
}
</script>
`);

  try {
    // 尝试使用ESLint检查该文件
    execSync(`npx eslint ${testFilePath}`, { stdio: 'pipe' });
    console.log('✅ ESLint配置验证通过');
  } catch (error) {
    console.log('❌ ESLint配置验证失败');
    console.log('错误信息:', error.message);
  } finally {
    // 清理测试文件
    fs.unlinkSync(testFilePath);
  }
} catch (error) {
  console.log('❌ 测试文件创建失败');
  console.log('错误信息:', error.message);
}

// 4. 提供修复建议
console.log('\n📋 总结与建议:');
if (missingDeps.length > 0) {
  console.log(`- 需要安装的缺失依赖: npm install --save-dev ${missingDeps.join(' ')}`);
}

if (!fs.existsSync(configPath)) {
  console.log('- 需要创建ESLint配置文件. 建议运行 `node scripts/setup-eslint.js`');
}

console.log('- 如需完整配置ESLint，请运行 `node scripts/setup-eslint.js`');
console.log('\n🏁 检查完成!'); 