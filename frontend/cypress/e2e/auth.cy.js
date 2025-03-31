/// <reference types="cypress" />

describe('认证功能 E2E 测试', () => {
  // 测试前访问登录页面
  beforeEach(() => {
    cy.visit('/login')
  })

  it('显示登录页面', () => {
    cy.contains('登录')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('登录成功后跳转到首页', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: '测试用户',
          role: 'user'
        },
        accessToken: 'mock-jwt-token-xyz123',
        refreshToken: 'mock-refresh-token-abc789',
        message: '登录成功'
      }
    }).as('loginRequest')

    // 填写并提交表单
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // 等待API请求完成
    cy.wait('@loginRequest')

    // 验证跳转到首页
    cy.url().should('include', '/')

    // 验证页面显示登录后的状态
    cy.contains('测试用户')
    cy.contains('退出').should('exist')
  })

  it('登录失败时显示错误信息', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: '用户名或密码错误'
      }
    }).as('loginRequest')

    // 填写并提交表单
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    // 等待API请求完成
    cy.wait('@loginRequest')

    // The URL should still be login
    cy.url().should('include', '/login')

    // 验证错误信息显示
    cy.contains('用户名或密码错误')
    
    // 验证未登录状态
    cy.contains('登录').should('exist')
  })

  it('退出登录后返回到登录页面', () => {
    // 先登录
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          name: '测试用户',
          role: 'user'
        },
        accessToken: 'mock-jwt-token-xyz123',
        refreshToken: 'mock-refresh-token-abc789',
        message: '登录成功'
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')

    // 模拟退出登录响应
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: {
        success: true
      }
    }).as('logoutRequest')

    // 点击退出按钮
    cy.contains('退出').click()

    // 等待API请求完成
    cy.wait('@logoutRequest')

    // 验证返回到登录页面
    cy.url().should('include', '/login')
    cy.contains('登录').should('exist')
  })
}) 