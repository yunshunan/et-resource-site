/**
 * 服务验证工具
 * 用于验证各项服务连通性和配置正确性
 */

// 验证API服务
const validateAPI = async () => {
  try {
    const response = await fetch('/api/health-check');
    if (!response.ok) {
      throw new Error(`API服务返回错误状态: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ API服务验证成功:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ API服务验证失败:', error);
    return { success: false, error: error.message };
  }
};

// 验证环境变量配置
const validateEnvVars = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_LEANCLOUD_APP_ID',
    'VITE_LEANCLOUD_APP_KEY',
    'VITE_LEANCLOUD_SERVER_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];

  const missingVars = [];
  const placeholderVars = [];

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('your_') || value === 'undefined') {
      placeholderVars.push(varName);
    }
  });

  if (missingVars.length === 0 && placeholderVars.length === 0) {
    console.log('✅ 环境变量验证成功: 所有必需变量已配置');
    return { success: true };
  } else {
    console.warn('⚠️ 环境变量验证: 存在问题');
    if (missingVars.length > 0) {
      console.error('❌ 缺少环境变量:', missingVars.join(', '));
    }
    if (placeholderVars.length > 0) {
      console.warn('⚠️ 环境变量使用占位符:', placeholderVars.join(', '));
    }
    return { 
      success: false, 
      missingVars, 
      placeholderVars,
      message: '环境变量配置不完整，某些功能可能无法正常工作'
    };
  }
};

// 验证服务状态
const validateServices = async () => {
  console.log('🔄 开始验证服务状态...');
  
  const results = {
    timestamp: new Date().toISOString(),
    api: await validateAPI(),
    envVars: validateEnvVars()
  };
  
  // 总体状态评估
  results.overall = Object.values(results)
    .filter(r => typeof r === 'object' && r !== null && 'success' in r)
    .every(r => r.success);
  
  console.log(`${results.overall ? '✅' : '⚠️'} 服务验证${results.overall ? '全部通过' : '存在问题'}`, results);
  
  // 提供进一步操作建议
  if (!results.overall) {
    console.info('💡 建议操作:');
    
    if (!results.api.success) {
      console.info('- 检查后端服务是否正常运行（npm run dev）');
      console.info('- 确认API路由配置是否正确');
    }
    
    if (!results.envVars.success) {
      console.info('- 更新.env文件，填入真实的服务凭证');
      console.info('- 重启开发服务器以加载新的环境变量');
    }
  }
  
  return results;
};

// 导出验证函数
export {
  validateAPI,
  validateEnvVars,
  validateServices
};

export default validateServices; 