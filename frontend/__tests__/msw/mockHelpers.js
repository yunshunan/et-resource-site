/**
 * MSW测试帮助器 - 提供更简单的API请求模拟
 */
import { rest } from 'msw';
import { server } from './server';

// API基础URL
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

/**
 * 模拟成功的请求响应
 * @param {string} method - HTTP方法 ('GET', 'POST', 'PUT', 'DELETE')
 * @param {string} url - 请求URL路径 (不包括基础URL)
 * @param {Object} responseData - 要返回的响应数据
 * @param {number} status - HTTP状态码 (默认 200)
 */
export function mockRequestSuccess(method, url, responseData, status = 200) {
  // 格式化URL
  const formattedUrl = formatUrl(url);
  
  // 创建处理程序
  server.use(
    rest[method.toLowerCase()](formattedUrl, (req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.json(responseData)
      );
    })
  );
}

/**
 * 模拟失败的请求响应
 * @param {string} method - HTTP方法 ('GET', 'POST', 'PUT', 'DELETE')
 * @param {string} url - 请求URL路径 (不包括基础URL)
 * @param {number} status - HTTP状态码 (默认 400)
 * @param {string} message - 错误消息
 */
export function mockRequestFailure(method, url, status = 400, message = 'Bad Request') {
  // 格式化URL
  const formattedUrl = formatUrl(url);
  
  // 创建处理程序
  server.use(
    rest[method.toLowerCase()](formattedUrl, (req, res, ctx) => {
      return res(
        ctx.status(status),
        ctx.json({
          success: false,
          message: message
        })
      );
    })
  );
}

/**
 * 模拟网络错误
 * @param {string} method - HTTP方法 ('GET', 'POST', 'PUT', 'DELETE')
 * @param {string} url - 请求URL路径 (不包括基础URL)
 */
export function mockNetworkError(method, url) {
  // 格式化URL
  const formattedUrl = formatUrl(url);
  
  // 创建处理程序
  server.use(
    rest[method.toLowerCase()](formattedUrl, (req, res) => {
      return res.networkError('Network Error');
    })
  );
}

/**
 * 格式化URL，添加API基础URL前缀
 * @param {string} url - 原始URL
 * @returns {string} - 格式化后的URL
 */
function formatUrl(url) {
  // 确保URL以/开始
  const formattedPath = url.startsWith('/') ? url : `/${url}`;
  
  // 组合完整URL
  return `${API_BASE_URL}${formattedPath}`;
}

/**
 * API服务模拟对象
 */
export const apiServiceMock = {
  mockRequestSuccess,
  mockRequestFailure,
  mockNetworkError
};

export default apiServiceMock; 