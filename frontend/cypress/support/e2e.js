// Import commands.js using ES2015 syntax:
import './commands'

// 隐藏XHR请求日志
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// 修改Cypress错误处理，使其更具弹性
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略某些类型的错误以允许测试继续
  return false;
}); 