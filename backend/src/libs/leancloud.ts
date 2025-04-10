import AV from 'leancloud-storage';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const initLeanCloud = () => {
  try {
    // 获取LeanCloud配置项
    const appId = process.env.LEANCLOUD_APP_ID;
    const appKey = process.env.LEANCLOUD_APP_KEY;
    const masterKey = process.env.LEANCLOUD_MASTER_KEY;
    const serverURL = process.env.LEANCLOUD_SERVER_URL;

    if (!appId || !appKey) {
      throw new Error('LeanCloud 配置缺失。请检查环境变量 LEANCLOUD_APP_ID, LEANCLOUD_APP_KEY');
    }

    // 初始化LeanCloud - 使用符合中国区域要求的配置
    AV.init({
      appId, 
      appKey,
      // 中国区域应用必须设置 serverURLs
      serverURLs: {
        api: serverURL,
        engine: serverURL
      }
    });

    // 如果提供了 masterKey，使用它
    if (masterKey) {
      // 设置 masterKey
      AV.Cloud.useMasterKey();
    }
    
    console.log('LeanCloud 初始化成功');
    return AV;
  } catch (error) {
    console.error('LeanCloud 初始化失败:', error);
    throw error;
  }
};

// 导出初始化函数和 AV 实例
export { AV, initLeanCloud };

// 不要自动执行初始化，让应用程序控制初始化时机
// 这样可以在应用启动时正确初始化，并处理可能的错误 