/**
 * MSW (Mock Service Worker) 服务器配置
 * 提供更可靠的API模拟功能
 */

import { setupServer } from 'msw/node'
import { rest } from 'msw'

// 导入处理程序
import authHandlers from './handlers/auth'
import resourceHandlers from './handlers/resources'
import apiServiceMock from './mockHelpers'

// 创建默认处理器 - 这些将覆盖所有未明确处理的请求
const defaultHandlers = [
  // 处理所有未处理的GET请求，返回404
  rest.get('*', (req, res, ctx) => {
    console.log(`[MSW] 未处理的GET请求: ${req.url.toString()}`)
    return res(
      ctx.status(404),
      ctx.json({
        success: false,
        message: '资源不存在'
      })
    )
  }),
  
  // 处理所有未处理的POST请求，返回400
  rest.post('*', (req, res, ctx) => {
    console.log(`[MSW] 未处理的POST请求: ${req.url.toString()}`)
    return res(
      ctx.status(400),
      ctx.json({
        success: false,
        message: '无效请求'
      })
    )
  }),
  
  // 处理所有未处理的PUT请求，返回400
  rest.put('*', (req, res, ctx) => {
    console.log(`[MSW] 未处理的PUT请求: ${req.url.toString()}`)
    return res(
      ctx.status(400),
      ctx.json({
        success: false,
        message: '无效请求'
      })
    )
  }),
  
  // 处理所有未处理的DELETE请求，返回400
  rest.delete('*', (req, res, ctx) => {
    console.log(`[MSW] 未处理的DELETE请求: ${req.url.toString()}`)
    return res(
      ctx.status(400),
      ctx.json({
        success: false,
        message: '无效请求'
      })
    )
  })
]

// 合并所有处理器
export const handlers = [
  ...authHandlers,
  ...resourceHandlers,
  ...defaultHandlers
]

// 创建服务器实例
export const server = setupServer(...handlers)

/**
 * 重置服务器请求处理器
 * @param {Array} newHandlers - 新的处理器数组
 */
export function resetHandlers(newHandlers = handlers) {
  server.resetHandlers(...newHandlers)
}

/**
 * 添加自定义处理器
 * @param {Array} customHandlers - 要添加的自定义处理器
 */
export function useCustomHandlers(customHandlers = []) {
  server.use(...customHandlers)
}

/**
 * 创建模拟网络错误的处理器
 * @param {string} method - HTTP方法 ('get', 'post', 'put', 'delete')
 * @param {string} url - 要匹配的URL路径，可以是完整URL或通配符路径
 * @returns {Object} - MSW处理器
 */
export function createNetworkErrorHandler(method, url) {
  // 添加/api前缀以适配API服务配置
  const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  // 使用原始的URL生成Handler，因为这将直接与axios请求匹配
  const fullApiUrl = `/api${apiUrl}`;
  
  return rest[method.toLowerCase()](fullApiUrl, (req, res) => {
    // 直接抛出NetworkError，不返回任何响应数据
    return res.networkError('Network Error');
  })
}

/**
 * 创建模拟服务器错误的处理器
 * @param {string} method - HTTP方法 ('get', 'post', 'put', 'delete')
 * @param {string} url - 要匹配的URL路径，可以是完整URL或通配符路径
 * @param {number} status - HTTP状态码 (默认 500)
 * @param {string} message - 错误消息 (默认 '服务器错误')
 * @returns {Object} - MSW处理器
 */
export function createServerErrorHandler(method, url, status = 500, message = '服务器错误') {
  // 添加/api前缀以适配API服务配置
  const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  
  // 使用原始的URL生成Handler，因为这将直接与axios请求匹配
  const fullApiUrl = `/api${apiUrl}`;
  
  return rest[method.toLowerCase()](fullApiUrl, (req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json({
        success: false,
        message
      })
    )
  })
}

// 添加模拟辅助对象导出
export { apiServiceMock }

// 导出
export default server 