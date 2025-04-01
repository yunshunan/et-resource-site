import { describe, it, expect, beforeEach, vi } from 'vitest'
import { privacyService } from '@/services/privacy'
import CryptoJS from 'crypto-js'

describe('Privacy Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('encryptData', () => {
    it('should encrypt sensitive data correctly', () => {
      const sensitiveData = { email: 'test@example.com', phone: '1234567890' }
      const encrypted = privacyService.encryptData(sensitiveData)
      expect(encrypted).not.toBe(sensitiveData)
      expect(typeof encrypted).toBe('string')
    })

    it('should handle empty data', () => {
      const encrypted = privacyService.encryptData({})
      expect(encrypted).toBe('')
    })

    it('should handle null data', () => {
      const encrypted = privacyService.encryptData(null)
      expect(encrypted).toBe('')
    })
  })

  describe('decryptData', () => {
    it('should decrypt data correctly', () => {
      const originalData = { email: 'test@example.com', phone: '1234567890' }
      const encrypted = privacyService.encryptData(originalData)
      const decrypted = privacyService.decryptData(encrypted)
      expect(decrypted).toEqual(originalData)
    })

    it('should handle invalid encrypted data', () => {
      const decrypted = privacyService.decryptData('invalid-data')
      expect(decrypted).toBe('')
    })
  })

  describe('maskSensitiveData', () => {
    it('should mask email addresses', () => {
      const data = { email: 'test@example.com' }
      const masked = privacyService.maskSensitiveData(data)
      expect(masked.email).toBe('t***@example.com')
    })

    it('should mask phone numbers', () => {
      const data = { phone: '1234567890' }
      const masked = privacyService.maskSensitiveData(data)
      expect(masked.phone).toBe('******7890')
    })

    it('should handle nested objects', () => {
      const data = {
        user: {
          email: 'test@example.com',
          phone: '1234567890'
        }
      }
      const masked = privacyService.maskSensitiveData(data)
      expect(masked.user.email).toBe('t***@example.com')
      expect(masked.user.phone).toBe('******7890')
    })
  })

  describe('exportUserData', () => {
    it('should export user data in correct format', async () => {
      const mockUserData = {
        profile: { name: 'Test User' },
        settings: { theme: 'dark' }
      }
      
      const exportKey = 'test-key'
      const result = await privacyService.exportUserData(mockUserData, exportKey)
      
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('version')
    })

    it('should handle export errors', async () => {
      const mockUserData = null
      const exportKey = 'test-key'
      
      await expect(privacyService.exportUserData(mockUserData, exportKey))
        .rejects
        .toThrow('Invalid user data')
    })
  })

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      const mockUserData = {
        profile: { name: 'Test User' },
        settings: { theme: 'dark' }
      }
      
      const result = await privacyService.deleteUserData(mockUserData)
      expect(result).toBe(true)
    })

    it('should handle deletion errors', async () => {
      const mockUserData = null
      
      await expect(privacyService.deleteUserData(mockUserData))
        .rejects
        .toThrow('Invalid user data')
    })
  })

  describe('validateDataIntegrity', () => {
    it('should validate data integrity correctly', () => {
      const data = { test: 'data' }
      const hash = CryptoJS.SHA256(JSON.stringify(data)).toString()
      const result = privacyService.validateDataIntegrity(data, hash)
      expect(result).toBe(true)
    })

    it('should detect data tampering', () => {
      const data = { test: 'data' }
      const hash = 'invalid-hash'
      const result = privacyService.validateDataIntegrity(data, hash)
      expect(result).toBe(false)
    })
  })
}) 