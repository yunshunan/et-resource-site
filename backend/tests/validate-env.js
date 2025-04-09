/**
 * 环境变量验证工具
 * 用于在命令行中验证后端环境变量配置
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// 定义必需的环境变量
const requiredVars = [
  'PORT',
  'MONGO_URI',
  'NODE_ENV',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'LEANCLOUD_APP_ID',
  'LEANCLOUD_APP_KEY',
  'LEANCLOUD_SERVER_URL',
  'API_BASE_URL'
];

// 验证环境变量
const validateEnvVars = () => {
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (
      value.includes('your_') || 
      value === 'undefined' ||
      value.includes('localhost') && varName !== 'MONGO_URI' && varName !== 'API_BASE_URL'
    ) {
      placeholderVars.push(varName);
    }
  });
  
  return { missingVars, placeholderVars };
};

// 显示验证结果
const displayResults = (results) => {
  console.log('\n===== 后端环境变量验证 =====');
  
  if (results.missingVars.length === 0 && results.placeholderVars.length === 0) {
    console.log('✅ 所有必需环境变量已正确配置');
    return true;
  }
  
  if (results.missingVars.length > 0) {
    console.error('❌ 缺少以下环境变量:');
    results.missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
  }
  
  if (results.placeholderVars.length > 0) {
    console.warn('⚠️ 以下环境变量使用了占位符:');
    results.placeholderVars.forEach(varName => {
      console.warn(`   - ${varName}: "${process.env[varName]}"`);
    });
  }
  
  console.log('\n💡 建议操作:');
  console.log('1. 在 .env 文件中更新这些环境变量');
  console.log('2. 重启后端服务器以加载新配置');
  console.log('3. 从服务提供商处获取实际的凭证信息:');
  console.log('   - LeanCloud: https://leancloud.cn/dashboard/');
  console.log('   - JWT密钥: 生成一个强随机字符串');
  
  return false;
};

// 检查.env文件是否存在
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env 文件不存在 - 请从 .env.example 创建');
    return false;
  }
  return true;
};

// 主函数
const main = () => {
  // 检查.env文件
  if (!checkEnvFile()) {
    process.exit(1);
  }
  
  // 验证环境变量
  const results = validateEnvVars();
  const isValid = displayResults(results);
  
  // 打印当前配置
  console.log('\n===== 当前环境配置 =====');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`PORT: ${process.env.PORT}`);
  console.log(`API_BASE_URL: ${process.env.API_BASE_URL}`);
  
  // 设置退出码
  process.exit(isValid ? 0 : 1);
};

// 执行主函数
main(); 