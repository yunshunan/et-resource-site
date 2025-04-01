import CryptoJS from 'crypto-js'

// 敏感字段列表
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'key',
  'secret',
  'credit',
  'card',
  'ssn',
  'idNumber',
  'phone',
  'email',
  'address'
]

// 敏感字段模式
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /credit/i,
  /card/i,
  /ssn/i,
  /idNumber/i,
  /phone/i,
  /email/i,
  /address/i
]

/**
 * 检查字段是否为敏感字段
 * @param {string} field - 字段名
 * @returns {boolean} - 是否为敏感字段
 */
export const isSensitiveField = (field) => {
  return SENSITIVE_FIELDS.includes(field.toLowerCase()) ||
    SENSITIVE_PATTERNS.some(pattern => pattern.test(field))
}

/**
 * 脱敏数据
 * @param {string} data - 原始数据
 * @param {string} type - 数据类型
 * @returns {string} - 脱敏后的数据
 */
export const anonymizeData = (data, type) => {
  if (!data) return data
  
  switch (type) {
    case 'email':
      return data.replace(/(.{2}).*(?=@)/, '$1***')
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    case 'idNumber':
      return data.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    case 'address':
      return data.replace(/(.{3}).*(.{3})/, '$1***$2')
    default:
      return '***'
  }
}

/**
 * 加密数据
 * @param {string} data - 原始数据
 * @param {string} key - 加密密钥
 * @returns {string} - 加密后的数据
 */
export const encryptData = (data, key) => {
  try {
    const jsonString = JSON.stringify(data)
    return CryptoJS.AES.encrypt(jsonString, key).toString()
  } catch (error) {
    console.error('数据加密失败:', error)
    return null
  }
}

/**
 * 解密数据
 * @param {string} encryptedData - 加密数据
 * @param {string} key - 解密密钥
 * @returns {any} - 解密后的数据
 */
export const decryptData = (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    const jsonString = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('数据解密失败:', error)
    return null
  }
}

/**
 * 哈希数据
 * @param {string} data - 原始数据
 * @returns {string} - 哈希后的数据
 */
export const hashData = (data) => {
  return CryptoJS.SHA256(data.toString()).toString()
}

/**
 * 清理敏感数据
 * @param {Object} data - 原始数据对象
 * @returns {Object} - 清理后的数据对象
 */
export const sanitizeData = (data) => {
  const sanitized = { ...data }
  
  Object.keys(sanitized).forEach(key => {
    if (isSensitiveField(key)) {
      sanitized[key] = '[REDACTED]'
    }
  })
  
  return sanitized
}

/**
 * 生成数据指纹
 * @param {Object} data - 数据对象
 * @returns {string} - 数据指纹
 */
export const generateDataFingerprint = (data) => {
  const sortedData = JSON.stringify(data, Object.keys(data).sort())
  return hashData(sortedData)
}

/**
 * 检查数据完整性
 * @param {Object} data - 数据对象
 * @param {string} fingerprint - 数据指纹
 * @returns {boolean} - 数据是否完整
 */
export const verifyDataIntegrity = (data, fingerprint) => {
  const currentFingerprint = generateDataFingerprint(data)
  return currentFingerprint === fingerprint
}

/**
 * 生成随机ID
 * @returns {string} - 随机ID
 */
export const generateRandomId = () => {
  return CryptoJS.lib.WordArray.random(16).toString()
}

/**
 * 生成会话令牌
 * @returns {string} - 会话令牌
 */
export const generateSessionToken = () => {
  return CryptoJS.lib.WordArray.random(32).toString()
}

/**
 * 验证会话令牌
 * @param {string} token - 会话令牌
 * @returns {boolean} - 令牌是否有效
 */
export const validateSessionToken = (token) => {
  return token && token.length === 64
}

/**
 * 生成数据导出密钥
 * @returns {string} - 导出密钥
 */
export const generateExportKey = () => {
  return CryptoJS.lib.WordArray.random(24).toString()
}

/**
 * 验证数据导出密钥
 * @param {string} key - 导出密钥
 * @returns {boolean} - 密钥是否有效
 */
export const validateExportKey = (key) => {
  return key && key.length === 48
} 