import axios from 'axios'
import { encryptData, decryptData, generateDataFingerprint } from '@/utils/privacy'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 加密敏感数据
    if (config.data) {
      const sensitiveData = encryptData(config.data, process.env.VUE_APP_ENCRYPTION_KEY)
      if (sensitiveData) {
        config.data = sensitiveData
      }
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 解密响应数据
    if (response.data) {
      const decryptedData = decryptData(response.data, process.env.VUE_APP_ENCRYPTION_KEY)
      if (decryptedData) {
        response.data = decryptedData
      }
    }
    
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 获取用户隐私设置
 * @returns {Promise} - 用户隐私设置
 */
export const getUserPrivacySettings = () => {
  return api.get('/api/privacy/settings')
}

/**
 * 更新用户隐私设置
 * @param {Object} settings - 隐私设置
 * @returns {Promise} - 更新结果
 */
export const updateUserPrivacySettings = (settings) => {
  return api.put('/api/privacy/settings', settings)
}

/**
 * 获取用户数据导出
 * @returns {Promise} - 用户数据
 */
export const exportUserData = () => {
  return api.get('/api/privacy/export')
}

/**
 * 删除用户数据
 * @returns {Promise} - 删除结果
 */
export const deleteUserData = () => {
  return api.delete('/api/privacy/data')
}

/**
 * 获取隐私政策
 * @returns {Promise} - 隐私政策
 */
export const getPrivacyPolicy = () => {
  return api.get('/api/privacy/policy')
}

/**
 * 更新隐私政策接受状态
 * @param {Object} consent - 同意信息
 * @returns {Promise} - 更新结果
 */
export const updatePrivacyConsent = (consent) => {
  return api.post('/api/privacy/consent', consent)
}

/**
 * 获取数据收集状态
 * @returns {Promise} - 数据收集状态
 */
export const getDataCollectionStatus = () => {
  return api.get('/api/privacy/collection-status')
}

/**
 * 更新数据收集状态
 * @param {Object} status - 收集状态
 * @returns {Promise} - 更新结果
 */
export const updateDataCollectionStatus = (status) => {
  return api.put('/api/privacy/collection-status', status)
}

/**
 * 获取数据保留策略
 * @returns {Promise} - 数据保留策略
 */
export const getDataRetentionPolicy = () => {
  return api.get('/api/privacy/retention-policy')
}

/**
 * 更新数据保留策略
 * @param {Object} policy - 保留策略
 * @returns {Promise} - 更新结果
 */
export const updateDataRetentionPolicy = (policy) => {
  return api.put('/api/privacy/retention-policy', policy)
}

/**
 * 获取数据共享设置
 * @returns {Promise} - 数据共享设置
 */
export const getDataSharingSettings = () => {
  return api.get('/api/privacy/sharing-settings')
}

/**
 * 更新数据共享设置
 * @param {Object} settings - 共享设置
 * @returns {Promise} - 更新结果
 */
export const updateDataSharingSettings = (settings) => {
  return api.put('/api/privacy/sharing-settings', settings)
}

/**
 * 获取数据安全报告
 * @returns {Promise} - 安全报告
 */
export const getSecurityReport = () => {
  return api.get('/api/privacy/security-report')
}

/**
 * 获取数据泄露通知
 * @returns {Promise} - 泄露通知
 */
export const getDataBreachNotifications = () => {
  return api.get('/api/privacy/breach-notifications')
}

/**
 * 更新数据泄露通知设置
 * @param {Object} settings - 通知设置
 * @returns {Promise} - 更新结果
 */
export const updateBreachNotificationSettings = (settings) => {
  return api.put('/api/privacy/breach-notifications', settings)
}

/**
 * 获取数据访问日志
 * @returns {Promise} - 访问日志
 */
export const getDataAccessLogs = () => {
  return api.get('/api/privacy/access-logs')
}

/**
 * 获取数据导出历史
 * @returns {Promise} - 导出历史
 */
export const getDataExportHistory = () => {
  return api.get('/api/privacy/export-history')
}

/**
 * 获取数据删除历史
 * @returns {Promise} - 删除历史
 */
export const getDataDeletionHistory = () => {
  return api.get('/api/privacy/deletion-history')
}

/**
 * 获取数据使用报告
 * @returns {Promise} - 使用报告
 */
export const getDataUsageReport = () => {
  return api.get('/api/privacy/usage-report')
}

/**
 * 获取数据合规性报告
 * @returns {Promise} - 合规性报告
 */
export const getComplianceReport = () => {
  return api.get('/api/privacy/compliance-report')
} 