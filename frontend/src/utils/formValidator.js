/**
 * 表单验证工具
 * 用于统一验证表单数据
 */

/**
 * 电子邮箱验证
 * @param {string} email - 电子邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  // 使用更安全的邮箱验证正则表达式
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * 用户名验证
 * @param {string} username - 用户名
 * @param {number} minLength - 最小长度，默认3
 * @returns {boolean} 是否有效
 */
export function isValidUsername(username, minLength = 3) {
  return typeof username === 'string' && username.length >= minLength;
}

/**
 * 密码验证
 * @param {string} password - 密码
 * @param {Object} options - 验证选项
 * @param {number} options.minLength - 最小长度，默认6
 * @param {boolean} options.requireNumber - 是否需要包含数字，默认false
 * @param {boolean} options.requireLetter - 是否需要包含字母，默认false
 * @param {boolean} options.requireSpecial - 是否需要包含特殊字符，默认false
 * @returns {boolean} 是否有效
 */
export function isValidPassword(password, options = {}) {
  const {
    minLength = 6,
    requireNumber = false,
    requireLetter = false,
    requireSpecial = false
  } = options;
  
  // 检查最小长度
  if (typeof password !== 'string' || password.length < minLength) {
    return false;
  }
  
  // 检查是否包含数字
  if (requireNumber && !/\d/.test(password)) {
    return false;
  }
  
  // 检查是否包含字母
  if (requireLetter && !/[a-zA-Z]/.test(password)) {
    return false;
  }
  
  // 检查是否包含特殊字符
  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * 确认密码验证
 * @param {string} password - 密码
 * @param {string} confirmPassword - 确认密码
 * @returns {boolean} 是否匹配
 */
export function isPasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

/**
 * URL验证
 * @param {string} url - URL地址
 * @returns {boolean} 是否有效
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 手机号码验证（中国）
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否有效
 */
export function isValidChinesePhone(phone) {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

/**
 * 表单验证结果类型
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 是否有效
 * @property {Object} errors - 错误信息对象
 */

/**
 * 验证表单数据
 * @param {Object} formData - 表单数据
 * @param {Object} rules - 验证规则
 * @returns {ValidationResult} 验证结果
 */
export function validateForm(formData, rules) {
  const errors = {};
  
  // 遍历规则
  Object.entries(rules).forEach(([field, fieldRules]) => {
    // 获取字段值
    const value = formData[field];
    
    // 遍历字段规则
    fieldRules.forEach(rule => {
      // 如果已经有错误，跳过后续验证
      if (errors[field]) return;
      
      // 应用验证规则
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = rule.message || `${field}不能为空`;
      } else if (value !== undefined && value !== null && value !== '') {
        if (rule.validator && !rule.validator(value)) {
          errors[field] = rule.message || `${field}格式不正确`;
        }
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export default {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  isPasswordMatch,
  isValidUrl,
  isValidChinesePhone,
  validateForm
}; 