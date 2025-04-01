describe('Core Functionality Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('User Authentication', () => {
    it('should allow user registration', () => {
      cy.visit('/register')
      cy.get('input[name="username"]').type('testuser')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('Test123!')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/profile')
    })

    it('should allow user login', () => {
      cy.visit('/login')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('Test123!')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/profile')
    })

    it('should handle invalid credentials', () => {
      cy.visit('/login')
      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('WrongPass!')
      cy.get('button[type="submit"]').click()
      cy.get('.error-message').should('be.visible')
    })
  })

  describe('Resource Management', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'Test123!')
    })

    it('should allow resource upload', () => {
      cy.visit('/resources/upload')
      cy.get('input[type="file"]').attachFile('test-resource.zip')
      cy.get('input[name="title"]').type('Test Resource')
      cy.get('textarea[name="description"]').type('Test Description')
      cy.get('button[type="submit"]').click()
      cy.get('.success-message').should('be.visible')
    })

    it('should display user resources', () => {
      cy.visit('/resources/my')
      cy.get('.resource-list').should('exist')
    })

    it('should allow resource favoriting', () => {
      cy.visit('/resource-market')
      cy.get('.resource-card').first().find('.favorite-btn').click()
      cy.visit('/resources/favorites')
      cy.get('.resource-list').should('have.length.greaterThan', 0)
    })
  })

  describe('Admin Features', () => {
    beforeEach(() => {
      cy.login('admin@example.com', 'Admin123!')
    })

    it('should access admin dashboard', () => {
      cy.visit('/admin/dashboard')
      cy.get('.admin-dashboard').should('exist')
    })

    it('should view performance metrics', () => {
      cy.visit('/admin/performance')
      cy.get('.performance-metrics').should('exist')
      cy.get('.chart-container').should('have.length.greaterThan', 0)
    })

    it('should manage user resources', () => {
      cy.visit('/admin/resources')
      cy.get('.resource-management').should('exist')
      cy.get('.resource-list').should('exist')
    })
  })

  describe('Performance Monitoring', () => {
    it('should record page load metrics', () => {
      cy.visit('/')
      cy.window().then((win) => {
        expect(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart).to.be.lessThan(3000)
      })
    })

    it('should handle slow network conditions', () => {
      cy.intercept('GET', '**/*', (req) => {
        req.reply({
          delay: 1000,
          body: req.body
        })
      })
      cy.visit('/resource-market')
      cy.get('.loading-indicator').should('be.visible')
      cy.get('.resource-list').should('be.visible')
    })
  })

  describe('Notification System', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'Test123!')
    })

    it('should display notifications', () => {
      cy.visit('/')
      cy.get('.notification-bell').click()
      cy.get('.notifications-panel').should('be.visible')
    })

    it('should mark notifications as read', () => {
      cy.visit('/')
      cy.get('.notification-bell').click()
      cy.get('.notification-item').first().click()
      cy.get('.notification-item').first().should('not.have.class', 'unread')
    })
  })
}) 