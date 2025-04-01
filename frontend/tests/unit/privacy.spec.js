import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePrivacyStore } from '@/stores/privacy'
import { privacyService } from '@/services/privacy'
import {
  isSensitiveField,
  anonymizeData,
  encryptData,
  decryptData,
  hashData,
  sanitizeData,
  generateDataFingerprint,
  verifyDataIntegrity,
  generateRandomId,
  generateSessionToken,
  validateSessionToken,
  generateExportKey,
  validateExportKey
} from '@/utils/privacy'

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('Privacy Utils', () => {
  describe('isSensitiveField', () => {
    it('should identify sensitive fields', () => {
      expect(isSensitiveField('password')).toBe(true)
      expect(isSensitiveField('email')).toBe(true)
      expect(isSensitiveField('phone')).toBe(true)
      expect(isSensitiveField('name')).toBe(false)
    })
  })

  describe('anonymizeData', () => {
    it('should anonymize email addresses', () => {
      expect(anonymizeData('user@example.com', 'email')).toBe('us***@example.com')
    })

    it('should anonymize phone numbers', () => {
      expect(anonymizeData('13812345678', 'phone')).toBe('138****5678')
    })

    it('should anonymize ID numbers', () => {
      expect(anonymizeData('123456199001011234', 'idNumber')).toBe('123456********1234')
    })

    it('should anonymize addresses', () => {
      expect(anonymizeData('北京市朝阳区xxx街道', 'address')).toBe('北京***街道')
    })
  })

  describe('encryptData and decryptData', () => {
    const testData = { name: 'test', value: 123 }
    const key = 'test-key'

    it('should encrypt and decrypt data correctly', () => {
      const encrypted = encryptData(testData, key)
      expect(encrypted).not.toBeNull()
      expect(encrypted).not.toBe(testData)

      const decrypted = decryptData(encrypted, key)
      expect(decrypted).toEqual(testData)
    })

    it('should handle invalid encryption key', () => {
      const encrypted = encryptData(testData, key)
      const decrypted = decryptData(encrypted, 'wrong-key')
      expect(decrypted).toBeNull()
    })
  })

  describe('hashData', () => {
    it('should generate consistent hash for same input', () => {
      const data = 'test data'
      const hash1 = hashData(data)
      const hash2 = hashData(data)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashData('data1')
      const hash2 = hashData('data2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('sanitizeData', () => {
    it('should sanitize sensitive fields', () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
        password: 'secret123',
        token: 'abc123'
      }

      const sanitized = sanitizeData(data)
      expect(sanitized.name).toBe('John')
      expect(sanitized.email).toBe('[REDACTED]')
      expect(sanitized.password).toBe('[REDACTED]')
      expect(sanitized.token).toBe('[REDACTED]')
    })
  })

  describe('generateDataFingerprint and verifyDataIntegrity', () => {
    it('should generate consistent fingerprint for same data', () => {
      const data = { name: 'test', value: 123 }
      const fingerprint = generateDataFingerprint(data)
      expect(verifyDataIntegrity(data, fingerprint)).toBe(true)
    })

    it('should detect data tampering', () => {
      const data = { name: 'test', value: 123 }
      const fingerprint = generateDataFingerprint(data)
      data.value = 456
      expect(verifyDataIntegrity(data, fingerprint)).toBe(false)
    })
  })

  describe('token generation and validation', () => {
    it('should generate valid session tokens', () => {
      const token = generateSessionToken()
      expect(validateSessionToken(token)).toBe(true)
    })

    it('should generate valid export keys', () => {
      const key = generateExportKey()
      expect(validateExportKey(key)).toBe(true)
    })
  })
})

describe('Privacy Store', () => {
  let store

  beforeEach(() => {
    store = usePrivacyStore()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
  })

  it('should initialize with default values', () => {
    expect(store.consent.privacyPolicyAccepted).toBe(false)
    expect(store.consent.analytics).toBe(false)
    expect(store.consent.errorTracking).toBe(false)
  })

  it('should load consent from localStorage', async () => {
    const mockConsent = {
      privacyPolicyAccepted: true,
      analytics: true,
      errorTracking: true
    }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockConsent))

    await store.loadConsent()
    expect(store.consent).toEqual(mockConsent)
  })

  it('should update consent and save to localStorage', async () => {
    const updates = {
      privacyPolicyAccepted: true,
      analytics: true
    }

    localStorageMock.setItem.mockReturnValue(undefined)
    const result = await store.updateConsent(updates)

    expect(result).toBe(true)
    expect(store.consent.privacyPolicyAccepted).toBe(true)
    expect(store.consent.analytics).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should handle consent update errors', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const result = await store.updateConsent({
      privacyPolicyAccepted: true
    })

    expect(result).toBe(false)
    expect(store.error).toBe('更新隐私设置失败')
  })

  it('should accept all privacy settings', async () => {
    localStorageMock.setItem.mockReturnValue(undefined)
    const result = await store.acceptAll()

    expect(result).toBe(true)
    expect(store.consent.privacyPolicyAccepted).toBe(true)
    expect(store.consent.analytics).toBe(true)
    expect(store.consent.errorTracking).toBe(true)
    expect(store.consent.performance).toBe(true)
    expect(store.consent.userBehavior).toBe(true)
    expect(store.consent.thirdParty).toBe(true)
    expect(store.consent.marketing).toBe(true)
  })

  it('should reset all privacy settings', async () => {
    localStorageMock.setItem.mockReturnValue(undefined)
    const result = await store.resetConsent()

    expect(result).toBe(true)
    expect(store.consent.privacyPolicyAccepted).toBe(false)
    expect(store.consent.analytics).toBe(false)
    expect(store.consent.errorTracking).toBe(false)
    expect(store.consent.performance).toBe(false)
    expect(store.consent.userBehavior).toBe(false)
    expect(store.consent.thirdParty).toBe(false)
    expect(store.consent.marketing).toBe(false)
  })
}) 