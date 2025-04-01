import CryptoJS from 'crypto-js'

class Encryption {
  constructor() {
    this.algorithm = 'AES-256-GCM'
    this.keySize = 256
    this.ivSize = 128
    this.saltSize = 128
    this.iterations = 10000
  }

  /**
   * 生成随机密钥
   * @returns {string} 随机密钥
   */
  generateKey() {
    return CryptoJS.lib.WordArray.random(this.keySize / 8).toString()
  }

  /**
   * 生成随机IV
   * @returns {string} 随机IV
   */
  generateIV() {
    return CryptoJS.lib.WordArray.random(this.ivSize / 8).toString()
  }

  /**
   * 生成随机盐值
   * @returns {string} 随机盐值
   */
  generateSalt() {
    return CryptoJS.lib.WordArray.random(this.saltSize / 8).toString()
  }

  /**
   * 从密码派生密钥
   * @param {string} password 密码
   * @param {string} salt 盐值
   * @returns {string} 派生的密钥
   */
  deriveKey(password, salt) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySize / 32,
      iterations: this.iterations,
      hasher: CryptoJS.algo.SHA256
    }).toString()
  }

  /**
   * 加密数据
   * @param {string} data 要加密的数据
   * @param {string} key 加密密钥
   * @returns {string} 加密后的数据
   */
  encrypt(data, key) {
    try {
      const iv = this.generateIV()
      const salt = this.generateSalt()
      const derivedKey = this.deriveKey(key, salt)

      const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.GCM
      })

      // 组合加密结果：salt + iv + 加密数据
      return salt + iv + encrypted.toString()
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('加密失败')
    }
  }

  /**
   * 解密数据
   * @param {string} encryptedData 加密的数据
   * @param {string} key 解密密钥
   * @returns {string} 解密后的数据
   */
  decrypt(encryptedData, key) {
    try {
      // 提取salt、iv和加密数据
      const salt = encryptedData.substring(0, this.saltSize / 4)
      const iv = encryptedData.substring(this.saltSize / 4, (this.saltSize + this.ivSize) / 4)
      const data = encryptedData.substring((this.saltSize + this.ivSize) / 4)

      const derivedKey = this.deriveKey(key, salt)

      const decrypted = CryptoJS.AES.decrypt(data, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.GCM
      })

      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('解密失败')
    }
  }

  /**
   * 计算数据哈希
   * @param {string} data 要计算哈希的数据
   * @returns {string} 哈希值
   */
  hash(data) {
    return CryptoJS.SHA256(data).toString()
  }

  /**
   * 验证数据完整性
   * @param {string} data 原始数据
   * @param {string} hash 哈希值
   * @returns {boolean} 是否完整
   */
  verifyIntegrity(data, hash) {
    return this.hash(data) === hash
  }

  /**
   * 生成安全的随机字符串
   * @param {number} length 字符串长度
   * @returns {string} 随机字符串
   */
  generateSecureRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = CryptoJS.lib.WordArray.random(1).words[0] % chars.length
      result += chars[randomIndex]
    }
    
    return result
  }

  /**
   * 加密敏感字段
   * @param {Object} data 包含敏感信息的数据对象
   * @param {string} key 加密密钥
   * @param {Array<string>} sensitiveFields 敏感字段列表
   * @returns {Object} 加密后的数据对象
   */
  encryptSensitiveFields(data, key, sensitiveFields) {
    const encrypted = { ...data }
    
    sensitiveFields.forEach(field => {
      if (field in encrypted) {
        encrypted[field] = this.encrypt(encrypted[field], key)
      }
    })
    
    return encrypted
  }

  /**
   * 解密敏感字段
   * @param {Object} data 加密的数据对象
   * @param {string} key 解密密钥
   * @param {Array<string>} sensitiveFields 敏感字段列表
   * @returns {Object} 解密后的数据对象
   */
  decryptSensitiveFields(data, key, sensitiveFields) {
    const decrypted = { ...data }
    
    sensitiveFields.forEach(field => {
      if (field in decrypted) {
        decrypted[field] = this.decrypt(decrypted[field], key)
      }
    })
    
    return decrypted
  }
}

export const encryption = new Encryption() 