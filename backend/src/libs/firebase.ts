import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const initFirebase = () => {
  try {
    // 获取服务账号文件路径
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

    if (!serviceAccountPath) {
      throw new Error('Firebase服务账号路径未设置。请检查环境变量FIREBASE_SERVICE_ACCOUNT_KEY_PATH');
    }

    // 检查文件是否存在
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase服务账号文件不存在: ${serviceAccountPath}`);
    }

    // 读取服务账号文件
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    // 初始化Firebase Admin SDK
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
      });
      console.log('Firebase Admin SDK初始化成功');
    }

    return admin;
  } catch (error) {
    console.error('Firebase Admin SDK初始化失败:', error);
    throw error;
  }
};

// 初始化Firebase并导出
const firebase = initFirebase();
export default firebase; 