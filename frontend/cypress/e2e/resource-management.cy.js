/// <reference types="cypress" />

describe('资源管理功能测试', () => {
  beforeEach(() => {
    // 在每个测试前重置应用状态
    cy.clearLocalStorage()
    cy.clearCookies()
    
    // 加载测试数据
    cy.fixture('users').as('userData')
    cy.fixture('resources').as('resourceData')
    
    // 登录用户
    cy.fixture('users').then(userData => {
      cy.login(userData.testUser.email, userData.testUser.password)
    })
  })
  
  it('应该能够成功上传资源', function() {
    const { testResource } = this.resourceData
    
    // 访问资源上传页面
    cy.visit('/resources/upload')
    cy.url().should('include', '/resources/upload')
    
    // 填写表单
    cy.get('#title').type(testResource.title)
    cy.get('#description').type(testResource.description)
    cy.get('#category').select(testResource.category)
    
    // 添加标签
    testResource.tags.forEach(tag => {
      cy.get('#tag-input').type(tag)
      cy.contains('button', '添加').click()
    })
    
    // 模拟文件上传
    cy.get('#image').attachFile('test-image.jpg')
    cy.get('#file').attachFile('test-file.pdf')
    
    // 提交表单
    cy.get('button[type="submit"]').click()
    
    // 验证成功消息
    cy.contains('资源上传成功').should('be.visible')
    
    // 验证重定向到资源详情页或我的资源页面
    cy.url().should('include', '/resources/')
  })
  
  it('应该能够查看我的资源列表', function() {
    // 访问我的资源页面
    cy.visit('/resources/my')
    cy.url().should('include', '/resources/my')
    
    // 验证页面标题
    cy.contains('我的资源').should('be.visible')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 资源列表应该存在
    cy.get('.resource-list').should('exist')
    cy.get('.resource-card').should('have.length.at.least', 1)
  })
  
  it('应该能够编辑已有资源', function() {
    // 访问我的资源页面
    cy.visit('/resources/my')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 点击第一个资源的编辑按钮
    cy.get('.resource-card').first().contains('编辑').click()
    
    // 验证进入编辑页面
    cy.url().should('include', '/edit')
    
    // 修改标题
    const newTitle = `更新的资源标题 ${Date.now()}`
    cy.get('#title').clear().type(newTitle)
    
    // 提交表单
    cy.get('button[type="submit"]').click()
    
    // 验证成功消息
    cy.contains('资源更新成功').should('be.visible')
    
    // 返回我的资源页面并验证更新
    cy.visit('/resources/my')
    cy.waitForLoading()
    cy.get('.resource-card').first().should('contain', newTitle)
  })
  
  it('应该能够删除资源', function() {
    // 访问我的资源页面
    cy.visit('/resources/my')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 获取资源数量
    cy.get('.resource-card').then($cards => {
      const resourceCount = $cards.length
      
      // 点击第一个资源的删除按钮
      cy.get('.resource-card').first().contains('删除').click()
      
      // 确认删除
      cy.get('.modal-dialog').should('be.visible')
      cy.get('.modal-dialog').contains('确认').click()
      
      // 验证资源已被删除
      cy.contains('删除成功').should('be.visible')
      
      // 等待页面刷新
      cy.waitForLoading()
      
      // 验证资源数量减少
      cy.get('.resource-card').should('have.length', resourceCount - 1)
    })
  })
  
  it('应该能够收藏和取消收藏资源', function() {
    // 访问资源列表页面
    cy.visit('/resources')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 点击第一个资源进入详情页
    cy.get('.resource-card').first().click()
    
    // 点击收藏按钮
    cy.get('.favorite-button').click()
    
    // 验证收藏成功
    cy.get('.favorite-button').should('have.class', 'favorited')
    
    // 访问收藏列表页面
    cy.visit('/resources/favorites')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 验证资源在收藏列表中
    cy.get('.resource-card').should('have.length.at.least', 1)
    
    // 取消收藏
    cy.get('.resource-card').first().find('.favorite-button').click()
    
    // 验证从收藏列表中移除
    cy.contains('取消收藏成功').should('be.visible')
    cy.get('.resource-card').should('have.length', 0)
  })
  
  it('应该能够对资源进行评分', function() {
    // 访问资源列表页面
    cy.visit('/resources')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 点击第一个资源进入详情页
    cy.get('.resource-card').first().click()
    
    // 点击评分组件中的4星
    cy.get('.rating-component .star').eq(3).click()
    
    // 验证评分成功
    cy.contains('评分成功').should('be.visible')
    
    // 验证平均评分更新
    cy.get('.average-rating').should('exist')
  })
  
  it('应该能够按类别筛选资源', function() {
    // 访问资源列表页面
    cy.visit('/resources')
    
    // 等待资源加载
    cy.waitForLoading()
    
    // 获取第一个分类
    cy.get('.category-filter .category-item').first().then($category => {
      const categoryName = $category.text().trim()
      
      // 点击该分类
      cy.wrap($category).click()
      
      // 等待筛选结果加载
      cy.waitForLoading()
      
      // 验证所有显示的资源都属于该分类
      cy.get('.resource-card .category-badge').each($badge => {
        expect($badge.text().trim()).to.equal(categoryName)
      })
    })
  })
}) 