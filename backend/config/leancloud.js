const AV = require('leancloud-storage');
require('dotenv').config();

// 初始化 LeanCloud 存储服务
const initLeanCloud = () => {
  AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    serverURL: process.env.LEANCLOUD_SERVER_URL
  });
  console.log('LeanCloud 存储服务已初始化');
  return AV;
};

const leancloud = initLeanCloud();

module.exports = {
  leancloud,
  AV
}; 