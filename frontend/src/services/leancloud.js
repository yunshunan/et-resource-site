import AV from 'leancloud-storage';

// 初始化 LeanCloud 存储服务
const initLeanCloud = () => {
  AV.init({
    appId: import.meta.env.VITE_LEANCLOUD_APP_ID,
    appKey: import.meta.env.VITE_LEANCLOUD_APP_KEY,
    serverURL: import.meta.env.VITE_LEANCLOUD_SERVER_URL
  });
  console.log('LeanCloud 存储服务已初始化');
  return AV;
};

// 用户相关操作
const LeanCloudUser = {
  // 注册新用户
  register: async (username, password, email) => {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    
    try {
      const newUser = await user.signUp();
      return {
        success: true,
        userId: newUser.id,
        username: newUser.getUsername(),
        email: newUser.getEmail()
      };
    } catch (error) {
      console.error('注册用户失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 用户登录
  login: async (username, password) => {
    try {
      const user = await AV.User.logIn(username, password);
      return {
        success: true,
        userId: user.id,
        username: user.getUsername(),
        email: user.getEmail()
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 获取当前用户
  getCurrentUser: () => {
    const user = AV.User.current();
    if (user) {
      return {
        userId: user.id,
        username: user.getUsername(),
        email: user.getEmail()
      };
    }
    return null;
  },
  
  // 用户登出
  logout: () => {
    AV.User.logOut();
  }
};

// 资源存储相关操作
const LeanCloudStorage = {
  // 上传文件
  uploadFile: async (file, fileName) => {
    try {
      const avFile = new AV.File(fileName || file.name, file);
      const savedFile = await avFile.save();
      return {
        success: true,
        fileId: savedFile.id,
        url: savedFile.url()
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // 获取文件
  getFile: async (fileId) => {
    try {
      const query = new AV.Query('_File');
      const file = await query.get(fileId);
      return {
        success: true,
        fileId: file.id,
        url: file.url(),
        name: file.get('name')
      };
    } catch (error) {
      console.error('获取文件失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export const leancloud = initLeanCloud();
export const LeanCloudServices = {
  User: LeanCloudUser,
  Storage: LeanCloudStorage
};

export default LeanCloudServices; 