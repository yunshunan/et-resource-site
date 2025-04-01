/// <reference types="cypress" />

describe('用户资料功能测试', () => {
  beforeEach(() => {
    // 在每个测试前重置应用状态
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // 加载测试数据
    cy.fixture('users').as('userData')
    
    // 登录用户
    cy.fixture('users').then(userData => {
      cy.login(userData.testUser.email, userData.testUser.password)
    })
  })
  
  it('应该能够访问用户个人资料页面', function() {
    const { testUser } = this.userData
    
    // 访问用户资料页面
    cy.visit('/profile')
    cy.url().should('include', '/profile')
    
    // 验证用户资料显示
    cy.contains('个人资料').should('be.visible')
    cy.contains(testUser.username).should('be.visible')
    cy.contains(testUser.email).should('be.visible')
  })
  
  it('应该能够在个人资料页中导航到资源管理', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击资源管理链接
    cy.contains('我的资源').click()
    
    // 验证导航到资源管理页面
    cy.url().should('include', '/resources/my')
  })
  
  it('应该能够在个人资料页中导航到收藏管理', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击收藏管理链接
    cy.contains('我的收藏').click()
    
    // 验证导航到收藏管理页面
    cy.url().should('include', '/resources/favorites')
  })
  
  it('应该能够编辑用户基本信息', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击编辑按钮
    cy.contains('编辑资料').click()
    
    // 修改用户名
    const newUsername = `更新的用户名${Date.now()}`
    cy.get('#username').clear().type(newUsername)
    
    // 提交表单
    cy.get('form').submit()
    
    // 验证成功消息
    cy.contains('资料更新成功').should('be.visible')
    
    // 验证用户名已更新
    cy.contains(newUsername).should('be.visible')
  })
  
  it('应该能够修改密码', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击修改密码按钮
    cy.contains('修改密码').click()
    
    // 填写密码表单
    cy.get('#currentPassword').type('password123')
    cy.get('#newPassword').type('newpassword123')
    cy.get('#confirmPassword').type('newpassword123')
    
    // 提交表单
    cy.get('form').submit()
    
    // 验证成功消息
    cy.contains('密码修改成功').should('be.visible')
  })
  
  it('密码不匹配时应显示错误消息', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击修改密码按钮
    cy.contains('修改密码').click()
    
    // 填写密码表单，确认密码不匹配
    cy.get('#currentPassword').type('password123')
    cy.get('#newPassword').type('newpassword123')
    cy.get('#confirmPassword').type('differentpassword123')
    
    // 提交表单
    cy.get('form').submit()
    
    // 验证错误消息
    cy.contains('两次输入的密码不一致').should('be.visible')
  })
  
  it('应该能够上传用户头像', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击编辑按钮
    cy.contains('编辑资料').click()
    
    // 上传头像
    cy.get('input[type="file"]').attachFile('test-image.jpg')
    
    // 提交表单
    cy.get('form').submit()
    
    // 验证成功消息
    cy.contains('资料更新成功').should('be.visible')
    
    // 验证头像已更新
    cy.get('.user-avatar').should('be.visible')
  })
  
  it('应该能够查看用户活动历史', function() {
    // 访问用户资料页面
    cy.visit('/profile')
    
    // 点击活动历史标签
    cy.contains('活动历史').click()
    
    // 验证活动历史区域显示
    cy.get('.activity-history').should('be.visible')
    
    // 验证至少有一条历史记录
    cy.get('.activity-item').should('have.length.at.least', 1)
  })
}) 