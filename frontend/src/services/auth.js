// Authentication Service
// Provides authentication methods using Firebase Auth
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from '@firebase/auth';

/**
 * Authentication service for managing user authentication operations
 */
class AuthService {
  /**
   * Get the current authenticated user
   * @returns {Object|null} The current user or null if not authenticated
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Sign in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Firebase user object
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Register a new user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} displayName - User's display name
   * @returns {Promise<Object>} Firebase user object
   */
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Send a password reset email
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Update the current user's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<void>}
   */
  async updateUserProfile(profileData) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('用户未登录');
      
      await updateProfile(user, profileData);
    } catch (error) {
      console.error('Profile update error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Reauthenticate the current user
   * @param {string} password - Current user's password
   * @returns {Promise<Object>} Firebase user credential
   */
  async reauthenticate(password) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('用户未登录');
      if (!user.email) throw new Error('用户没有关联的电子邮箱');

      const credential = EmailAuthProvider.credential(user.email, password);
      return await reauthenticateWithCredential(user, credential);
    } catch (error) {
      console.error('Reauthentication error:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Set up an auth state observer
   * @param {Function} callback - Callback function that runs when auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Handle Firebase auth errors and convert them to user-friendly messages
   * @private
   * @param {Error} error - Firebase auth error
   * @returns {Error} Error with user-friendly message
   */
  _handleAuthError(error) {
    const errorCode = error.code;
    let errorMessage;

    switch (errorCode) {
      case 'auth/invalid-email':
        errorMessage = '邮箱地址格式不正确';
        break;
      case 'auth/user-disabled':
        errorMessage = '该用户账号已被禁用';
        break;
      case 'auth/user-not-found':
        errorMessage = '该邮箱地址未注册';
        break;
      case 'auth/wrong-password':
        errorMessage = '密码不正确';
        break;
      case 'auth/email-already-in-use':
        errorMessage = '该邮箱已被注册';
        break;
      case 'auth/weak-password':
        errorMessage = '密码强度太弱，请使用更复杂的密码';
        break;
      case 'auth/too-many-requests':
        errorMessage = '登录尝试次数过多，请稍后再试';
        break;
      case 'auth/requires-recent-login':
        errorMessage = '此操作需要最近的登录认证，请重新登录后再试';
        break;
      default:
        errorMessage = error.message || '认证过程中发生未知错误';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    return enhancedError;
  }
}

export default new AuthService(); 