import { test, expect } from '@playwright/test'

test.describe('Privacy Features', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('/')
  })

  test('should show privacy notice on first visit', async ({ page }) => {
    // 检查隐私通知是否显示
    const privacyNotice = await page.locator('.privacy-notice')
    await expect(privacyNotice).toBeVisible()

    // 检查通知内容
    await expect(page.locator('.privacy-notice h3')).toContainText('欢迎使用我们的服务')
    await expect(page.locator('.notice-highlights')).toBeVisible()
    await expect(page.locator('.notice-actions')).toBeVisible()
  })

  test('should navigate to privacy policy page', async ({ page }) => {
    // 点击查看隐私政策按钮
    await page.click('text=查看隐私政策')

    // 检查是否跳转到隐私政策页面
    await expect(page).toHaveURL('/privacy/policy')
    await expect(page.locator('h2')).toContainText('隐私政策')

    // 检查政策内容
    await expect(page.locator('.policy-section')).toHaveCount(11)
    await expect(page.locator('text=信息收集')).toBeVisible()
    await expect(page.locator('text=信息使用')).toBeVisible()
    await expect(page.locator('text=数据安全')).toBeVisible()
  })

  test('should handle privacy settings', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私设置页面
    await page.goto('/privacy/settings')

    // 检查设置选项
    await expect(page.locator('.settings-section')).toHaveCount(3)
    await expect(page.locator('text=数据收集')).toBeVisible()
    await expect(page.locator('text=数据共享')).toBeVisible()

    // 更新设置
    await page.click('text=分析数据 >> .el-switch')
    await page.click('text=错误追踪 >> .el-switch')
    
    // 检查设置是否保存
    await expect(page.locator('text=设置已更新')).toBeVisible()
  })

  test('should handle data export', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私设置页面
    await page.goto('/privacy/settings')

    // 点击导出数据按钮
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=导出我的数据')
    const download = await downloadPromise

    // 检查下载文件
    expect(download.suggestedFilename()).toMatch(/user-data-.*\.json/)
  })

  test('should handle data deletion', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私设置页面
    await page.goto('/privacy/settings')

    // 点击删除数据按钮
    await page.click('text=删除我的数据')

    // 检查确认对话框
    await expect(page.locator('.el-dialog')).toBeVisible()
    await expect(page.locator('.el-dialog__title')).toContainText('确认删除')

    // 确认删除
    await page.click('.el-dialog__footer >> text=确认删除')

    // 检查删除结果
    await expect(page.locator('text=数据删除成功')).toBeVisible()
  })

  test('should accept all privacy settings', async ({ page }) => {
    // 检查隐私通知
    const privacyNotice = await page.locator('.privacy-notice')
    await expect(privacyNotice).toBeVisible()

    // 点击接受所有按钮
    await page.click('text=接受所有')

    // 检查通知是否关闭
    await expect(privacyNotice).not.toBeVisible()

    // 检查设置是否更新
    await page.goto('/privacy/settings')
    await expect(page.locator('text=分析数据 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=错误追踪 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=性能监控 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=用户行为分析 >> .el-switch')).toBeChecked()
  })

  test('should customize privacy settings', async ({ page }) => {
    // 检查隐私通知
    const privacyNotice = await page.locator('.privacy-notice')
    await expect(privacyNotice).toBeVisible()

    // 点击自定义设置按钮
    await page.click('text=自定义设置')

    // 检查设置对话框
    await expect(page.locator('.privacy-settings-dialog')).toBeVisible()

    // 选择部分设置
    await page.click('text=分析数据 >> .el-switch')
    await page.click('text=错误追踪 >> .el-switch')

    // 保存设置
    await page.click('text=保存')

    // 检查通知是否关闭
    await expect(privacyNotice).not.toBeVisible()

    // 检查设置是否更新
    await page.goto('/privacy/settings')
    await expect(page.locator('text=分析数据 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=错误追踪 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=性能监控 >> .el-switch')).not.toBeChecked()
    await expect(page.locator('text=用户行为分析 >> .el-switch')).not.toBeChecked()
  })

  test('should persist privacy settings', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私设置页面
    await page.goto('/privacy/settings')

    // 更新设置
    await page.click('text=分析数据 >> .el-switch')
    await page.click('text=错误追踪 >> .el-switch')

    // 刷新页面
    await page.reload()

    // 检查设置是否保持
    await expect(page.locator('text=分析数据 >> .el-switch')).toBeChecked()
    await expect(page.locator('text=错误追踪 >> .el-switch')).toBeChecked()
  })

  test('should show privacy policy updates', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私政策页面
    await page.goto('/privacy/policy')

    // 检查最后更新时间
    await expect(page.locator('.last-updated')).toBeVisible()

    // 检查政策版本
    await expect(page.locator('text=版本 1.0')).toBeVisible()
  })

  test('should validate export key', async ({ page }) => {
    // 登录用户
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 访问隐私设置页面
    await page.goto('/privacy/settings')

    // 点击导出数据按钮
    await page.click('text=导出我的数据')

    // 检查导出密钥对话框
    await expect(page.locator('.export-key-dialog')).toBeVisible()

    // 输入无效密钥
    await page.fill('input[name="exportKey"]', 'invalid-key')
    await page.click('text=确认')

    // 检查错误提示
    await expect(page.locator('text=导出密钥无效')).toBeVisible()

    // 输入有效密钥
    await page.fill('input[name="exportKey"]', 'valid-key-123456789')
    await page.click('text=确认')

    // 检查下载开始
    const download = await page.waitForEvent('download')
    expect(download.suggestedFilename()).toMatch(/user-data-.*\.json/)
  })
}) 