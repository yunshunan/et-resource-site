// 通知配置
const notificationConfig = {
  types: {
    success: {
      icon: '✓',
      color: '#28a745',
      duration: 5000
    },
    warning: {
      icon: '⚠',
      color: '#ffc107',
      duration: 7000
    },
    error: {
      icon: '✕',
      color: '#dc3545',
      duration: 10000
    },
    info: {
      icon: 'ℹ',
      color: '#17a2b8',
      duration: 5000
    }
  },
  position: 'top-right',
  maxNotifications: 5
}

// 创建通知元素
const createNotificationElement = (message, type) => {
  const config = notificationConfig.types[type]
  const element = document.createElement('div')
  element.className = `compatibility-notification ${type}`
  element.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${config.icon}</span>
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `
  
  // 添加样式
  element.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    max-width: 400px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid ${config.color};
  `
  
  return element
}

// 添加通知样式
const addNotificationStyles = () => {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .compatibility-notification {
      margin-bottom: 10px;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .notification-icon {
      font-size: 18px;
      font-weight: bold;
    }
    
    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
      color: #6c757d;
      transition: color 0.2s;
    }
    
    .notification-close:hover {
      color: #343a40;
    }
  `
  document.head.appendChild(style)
}

// 显示通知
const showNotification = (message, type = 'info') => {
  // 确保样式已添加
  if (!document.querySelector('.compatibility-notification')) {
    addNotificationStyles()
  }
  
  const element = createNotificationElement(message, type)
  const container = document.createElement('div')
  container.className = 'notification-container'
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    padding: 20px;
    z-index: 9999;
  `
  
  // 获取或创建容器
  let notificationContainer = document.querySelector('.notification-container')
  if (!notificationContainer) {
    notificationContainer = container
    document.body.appendChild(notificationContainer)
  }
  
  // 添加通知到容器
  notificationContainer.appendChild(element)
  
  // 处理关闭按钮
  const closeButton = element.querySelector('.notification-close')
  closeButton.addEventListener('click', () => {
    element.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      element.remove()
      if (notificationContainer.children.length === 1) {
        notificationContainer.remove()
      }
    }, 300)
  })
  
  // 自动关闭
  const config = notificationConfig.types[type]
  setTimeout(() => {
    if (element.parentNode) {
      element.style.animation = 'slideOut 0.3s ease-out'
      setTimeout(() => {
        element.remove()
        if (notificationContainer.children.length === 1) {
          notificationContainer.remove()
        }
      }, 300)
    }
  }, config.duration)
  
  // 限制通知数量
  const notifications = notificationContainer.querySelectorAll('.compatibility-notification')
  if (notifications.length > notificationConfig.maxNotifications) {
    const oldestNotification = notifications[0]
    oldestNotification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      oldestNotification.remove()
      if (notificationContainer.children.length === 1) {
        notificationContainer.remove()
      }
    }, 300)
  }
}

// 测试完成通知
const notifyTestCompletion = (results) => {
  const { total, passed, failed } = results.performance.summary
  const score = results.compatibility.score
  
  if (failed === 0) {
    showNotification(
      `测试完成！所有${total}个测试用例全部通过，兼容性得分：${score}%`,
      'success'
    )
  } else {
    showNotification(
      `测试完成！${total}个测试用例中${passed}个通过，${failed}个失败，兼容性得分：${score}%`,
      'warning'
    )
  }
}

// 测试错误通知
const notifyTestError = (error) => {
  showNotification(
    `测试过程中发生错误：${error.message}`,
    'error'
  )
}

// 导出完成通知
const notifyExportCompletion = (format, success) => {
  if (success) {
    showNotification(
      `报告已成功导出为${format.toUpperCase()}格式`,
      'success'
    )
  } else {
    showNotification(
      `导出${format.toUpperCase()}报告失败，请重试`,
      'error'
    )
  }
}

export {
  notificationConfig,
  showNotification,
  notifyTestCompletion,
  notifyTestError,
  notifyExportCompletion
} 