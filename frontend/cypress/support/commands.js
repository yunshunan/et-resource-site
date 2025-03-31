// ***********************************************
// 自定义命令和重写
// https://on.cypress.io/custom-commands
// ***********************************************

// -- 登录命令 --
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('form').submit()
    // 等待重定向或确认登录成功
    cy.url().should('not.include', '/login')
  }, {
    cacheAcrossSpecs: true
  })
})

// 检查是否已登录
Cypress.Commands.add('checkLoggedIn', () => {
  cy.visit('/')
  cy.get('.nav-user-menu').should('be.visible')
})

// 上传文件命令
Cypress.Commands.add('uploadFile', { prevSubject: 'element' }, (subject, fileName, fileType) => {
  cy.fixture(fileName).then(fileContent => {
    const blob = Cypress.Blob.base64StringToBlob(fileContent, fileType)
    const testFile = new File([blob], fileName, { type: fileType })
    const dataTransfer = new DataTransfer()
    
    dataTransfer.items.add(testFile)
    const input = subject[0]
    input.files = dataTransfer.files
    return cy.wrap(subject).trigger('change', { force: true })
  })
})

// 资源创建命令
Cypress.Commands.add('createResource', (title, description, category, tags = []) => {
  cy.visit('/resources/upload')
  cy.get('#title').type(title)
  cy.get('#description').type(description)
  cy.get('#category').select(category)
  
  // 添加标签
  tags.forEach(tag => {
    cy.get('#tag-input').type(tag)
    cy.contains('button', '添加').click()
  })
  
  // 上传图片和文件
  cy.get('#image').attachFile('test-image.jpg')
  cy.get('#file').attachFile('test-file.pdf')
  
  // 提交表单
  cy.get('form').submit()
  
  // 等待提交完成
  cy.contains('上传成功', { timeout: 10000 }).should('be.visible')
})

// 等待加载完成
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.loading-spinner', { timeout: 10000, log: false })
    .should('not.exist')
}) 