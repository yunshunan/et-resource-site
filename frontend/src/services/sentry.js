import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/browser';
import { createApp } from 'vue';

// 初始化 Sentry
const initSentry = (app) => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN 未配置，错误监控未启用');
    return;
  }

  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: () => {}, // 暂时移除路由监控，等路由配置完成后再启用
        tracingOrigins: ['localhost', 'et-resource-site.com', /^\//]
      })
    ],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    logErrors: true
  });

  console.log('Sentry 错误监控已初始化');
};

// 捕获自定义错误
const captureError = (error, context = {}) => {
  Sentry.captureException(error, { 
    extra: context 
  });
};

// 设置用户信息
const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.userId || user.uid,
      username: user.username,
      email: user.email
    });
  } else {
    // 清除用户信息
    Sentry.setUser(null);
  }
};

// 添加面包屑（用于跟踪用户操作）
const addBreadcrumb = (message, category = 'action', level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data
  });
};

export {
  initSentry,
  captureError,
  setUserContext,
  addBreadcrumb
}; 