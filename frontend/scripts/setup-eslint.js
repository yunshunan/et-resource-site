/**
 * ESLint配置安装和验证脚本
 * 这个脚本会:
 * 1. 安装必要的ESLint依赖
 * 2. 创建配置文件
 * 3. 验证配置是否有效
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

// 要安装的依赖
const dependencies = [
  'eslint',
  'eslint-plugin-vue',
  'vue-eslint-parser',
  '@babel/eslint-parser'
];

console.log('开始配置ESLint...');

// 1. 安装依赖
console.log('\n步骤1: 安装ESLint依赖');
try {
  console.log(`正在安装: ${dependencies.join(', ')}`);
  execSync(`npm install --save-dev ${dependencies.join(' ')}`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('✅ 依赖安装成功');
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message);
  process.exit(1);
}

// 2. 创建配置文件
console.log('\n步骤2: 创建ESLint配置文件');
const eslintConfig = `module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  plugins: [
    'vue'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
}`;

const configPath = path.join(rootDir, '.eslintrc.js');
try {
  fs.writeFileSync(configPath, eslintConfig);
  console.log(`✅ 配置文件已创建: ${configPath}`);
} catch (error) {
  console.error('❌ 配置文件创建失败:', error.message);
  process.exit(1);
}

// 3. 验证配置
console.log('\n步骤3: 验证ESLint配置');
try {
  // 创建简单的Vue测试文件
  const testFile = path.join(rootDir, 'eslint-test.vue');
  fs.writeFileSync(testFile, `<template>
  <div>测试组件</div>
</template>

<script>
export default {
  name: 'TestComponent',
  data() {
    return {
      message: '测试'
    }
  }
}
</script>
`);
  
  // 运行ESLint验证配置
  console.log('正在验证配置...');
  execSync(`npx eslint ${testFile}`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
  
  // 清理测试文件
  fs.unlinkSync(testFile);
  console.log('✅ ESLint配置验证成功');
} catch (error) {
  console.error('❌ ESLint配置验证失败:', error.message);
  process.exit(1);
}

console.log('\n✅✅✅ ESLint配置完成，已准备好使用!'); 