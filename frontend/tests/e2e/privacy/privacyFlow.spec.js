import { describe, it, expect, beforeEach } from '@playwright/test'

describe('Privacy Flow Tests', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  describe('First Visit Privacy Notice', () => {
    it('should show privacy notice on first visit', async ({ page }) => {
      await expect(page.locator('.privacy-notice')).toBeVisible()
      await expect(page.locator('.privacy-notice__title')).toHaveText('隐私政策更新')
    })

    it('should allow accepting all settings', async ({ page }) => {
      await page.click('.privacy-notice__accept-all')
      await expect(page.locator('.privacy-notice')).not.toBeVisible()
      
      // Verify settings were saved
      const settings = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('privacySettings'))
      })
      expect(settings.analytics).toBe(true)
      expect(settings.marketing).toBe(true)
      expect(settings.performance).toBe(true)
    })

    it('should allow customizing settings', async ({ page }) => {
      await page.click('.privacy-notice__customize')
      await page.uncheck('input[name="analytics"]')
      await page.click('.privacy-settings__save')
      
      // Verify settings were saved
      const settings = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('privacySettings'))
      })
      expect(settings.analytics).toBe(false)
    })
  })

  describe('Privacy Settings Management', () => {
    it('should allow updating settings after initial setup', async ({ page }) => {
      // First accept all settings
      await page.click('.privacy-notice__accept-all')
      
      // Navigate to settings
      await page.click('a[href="/privacy/settings"]')
      
      // Update settings
      await page.uncheck('input[name="marketing"]')
      await page.click('.privacy-settings__save')
      
      // Verify changes
      const settings = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('privacySettings'))
      })
      expect(settings.marketing).toBe(false)
    })

    it('should persist settings after page refresh', async ({ page }) => {
      // Set initial settings
      await page.click('.privacy-notice__accept-all')
      await page.click('a[href="/privacy/settings"]')
      await page.uncheck('input[name="performance"]')
      await page.click('.privacy-settings__save')
      
      // Refresh page
      await page.reload()
      
      // Verify settings persisted
      const settings = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('privacySettings'))
      })
      expect(settings.performance).toBe(false)
    })
  })

  describe('Data Export', () => {
    it('should allow exporting user data', async ({ page }) => {
      // Login first
      await page.click('a[href="/login"]')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      // Navigate to privacy settings
      await page.click('a[href="/privacy/settings"]')
      
      // Export data
      await page.click('.privacy-settings__export')
      await page.fill('input[name="exportKey"]', 'test-key')
      await page.click('button[type="submit"]')
      
      // Verify download started
      const download = await page.waitForEvent('download')
      expect(download.suggestedFilename()).toContain('user-data')
    })

    it('should validate export key', async ({ page }) => {
      // Login and navigate to settings
      await page.click('a[href="/login"]')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.click('a[href="/privacy/settings"]')
      
      // Try export with invalid key
      await page.click('.privacy-settings__export')
      await page.fill('input[name="exportKey"]', '')
      await page.click('button[type="submit"]')
      
      // Verify error message
      await expect(page.locator('.error-message')).toHaveText('请输入有效的导出密钥')
    })
  })

  describe('Data Deletion', () => {
    it('should allow requesting data deletion', async ({ page }) => {
      // Login and navigate to settings
      await page.click('a[href="/login"]')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.click('a[href="/privacy/settings"]')
      
      // Request deletion
      await page.click('.privacy-settings__delete')
      await page.fill('input[name="confirmation"]', 'DELETE')
      await page.click('button[type="submit"]')
      
      // Verify confirmation message
      await expect(page.locator('.success-message')).toHaveText('删除请求已提交')
    })

    it('should require confirmation text for deletion', async ({ page }) => {
      // Login and navigate to settings
      await page.click('a[href="/login"]')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.click('a[href="/privacy/settings"]')
      
      // Try deletion without confirmation
      await page.click('.privacy-settings__delete')
      await page.click('button[type="submit"]')
      
      // Verify error message
      await expect(page.locator('.error-message')).toHaveText('请输入确认文本')
    })
  })

  describe('Privacy Policy', () => {
    it('should display privacy policy content', async ({ page }) => {
      await page.click('a[href="/privacy/policy"]')
      await expect(page.locator('.privacy-policy')).toBeVisible()
      await expect(page.locator('.privacy-policy__version')).toHaveText(/版本/)
      await expect(page.locator('.privacy-policy__last-updated')).toHaveText(/最后更新/)
    })

    it('should show policy update notification when new version available', async ({ page }) => {
      // Simulate new policy version
      await page.evaluate(() => {
        localStorage.setItem('privacyPolicyVersion', '1.0')
        localStorage.setItem('lastAcceptedVersion', '0.9')
      })
      
      await page.goto('/')
      await expect(page.locator('.privacy-notice')).toBeVisible()
      await expect(page.locator('.privacy-notice__title')).toHaveText('隐私政策更新')
    })
  })
}) 