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
    
    // 构造初始化选项
    const initOptions: any = {
      appId,
      appKey,
      serverURLs: {
        api: serverURL,
        engine: serverURL
      }
    };

    // 如果提供了 masterKey，直接在 init 时传入
    if (masterKey) {
      console.log('检测到 Master Key，将使用 Master Key 初始化');
      initOptions.masterKey = masterKey;
    } else {
      console.warn('未提供 Master Key，将使用 App Key 初始化。某些管理操作可能受限。');
    }

    // 初始化LeanCloud
    AV.init(initOptions);
    
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