/**
 * 通知服务工具
 * 用于处理应用内通知
 */

// 通知存储
let notifications = [];

// 通知类型
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  PERFORMANCE: 'performance'
};

/**
 * 添加通知
 * @param {Object} notification 通知对象
 * @returns {string} 通知ID
 */
export function addNotification(notification) {
  const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const newNotification = {
    id,
    timestamp: Date.now(),
    read: false,
    ...notification
  };
  
  notifications.push(newNotification);
  
  // 如果通知数量超过20条，删除最早的通知
  if (notifications.length > 20) {
    notifications.shift();
  }
  
  // 触发事件，通知UI更新
  const event = new CustomEvent('notification-added', { 
    detail: { notification: newNotification } 
  });
  window.dispatchEvent(event);
  
  return id;
}

/**
 * 发送信息通知
 * @param {string} message 通知消息
 * @param {string} title 通知标题
 * @returns {string} 通知ID
 */
export function sendInfo(message, title = '信息') {
  return addNotification({
    type: NOTIFICATION_TYPES.INFO,
    title,
    message
  });
}

/**
 * 发送成功通知
 * @param {string} message 通知消息
 * @param {string} title 通知标题
 * @returns {string} 通知ID
 */
export function sendSuccess(message, title = '成功') {
  return addNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    title,
    message
  });
}

/**
 * 发送警告通知
 * @param {string} message 通知消息
 * @param {string} title 通知标题
 * @returns {string} 通知ID
 */
export function sendWarning(message, title = '警告') {
  return addNotification({
    type: NOTIFICATION_TYPES.WARNING,
    title,
    message
  });
}

/**
 * 发送错误通知
 * @param {string} message 通知消息
 * @param {string} title 通知标题
 * @returns {string} 通知ID
 */
export function sendError(message, title = '错误') {
  return addNotification({
    type: NOTIFICATION_TYPES.ERROR,
    title,
    message
  });
}

/**
 * 发送性能警告通知
 * @param {Object} warning 性能警告对象
 * @returns {string} 通知ID
 */
export function sendPerformanceWarning(warning) {
  return addNotification({
    type: NOTIFICATION_TYPES.PERFORMANCE,
    title: `性能警告: ${warning.metric}`,
    message: warning.message,
    data: warning
  });
}

/**
 * 获取所有通知
 * @returns {Array} 通知列表
 */
export function getNotifications() {
  return [...notifications];
}

/**
 * 获取未读通知
 * @returns {Array} 未读通知列表
 */
export function getUnreadNotifications() {
  return notifications.filter(notification => !notification.read);
}

/**
 * 标记通知为已读
 * @param {string} id 通知ID
 * @returns {boolean} 是否成功标记
 */
export function markAsRead(id) {
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
    return true;
  }
  
  return false;
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead() {
  notifications.forEach(notification => {
    notification.read = true;
  });
}

/**
 * 删除通知
 * @param {string} id 通知ID
 * @returns {boolean} 是否成功删除
 */
export function removeNotification(id) {
  const initialLength = notifications.length;
  notifications = notifications.filter(n => n.id !== id);
  return notifications.length < initialLength;
}

/**
 * 清除所有通知
 */
export function clearAllNotifications() {
  notifications = [];
}

// 导出通知服务工具
export default {
  sendInfo,
  sendSuccess,
  sendWarning,
  sendError,
  sendPerformanceWarning,
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  NOTIFICATION_TYPES
}; 