import { initializeApp } from '@firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from '@firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 初始化 Firebase
const initFirebase = () => {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('Firebase 服务已初始化');
  return { app, auth };
};

const { app, auth } = initFirebase();
const googleProvider = new GoogleAuthProvider();

// Firebase 认证服务
const FirebaseAuth = {
  // 邮箱密码注册
  registerWithEmail: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Firebase 邮箱注册失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 邮箱密码登录
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Firebase 邮箱登录失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Google 登录
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: result.user,
        credential: GoogleAuthProvider.credentialFromResult(result)
      };
    } catch (error) {
      console.error('Google 登录失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 登出
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取当前用户
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // 监听认证状态变化
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // 获取 ID Token
  getIdToken: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        return { success: true, token };
      } catch (error) {
        console.error('获取 ID Token 失败:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
    return {
      success: false,
      error: '用户未登录'
    };
  }
};

export { app, auth, FirebaseAuth };
export default FirebaseAuth; 