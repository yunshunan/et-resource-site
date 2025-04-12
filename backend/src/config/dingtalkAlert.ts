import axios from 'axios';
import crypto from 'crypto';
import os from 'os';

// 从环境变量获取钉钉配置
const DINGTALK_WEBHOOK = process.env.DINGTALK_WEBHOOK;
const DINGTALK_SECRET = process.env.DINGTALK_SECRET;

/**
 * 钉钉机器人工具类
 * 用于向钉钉群发送各类通知，尤其是错误报警
 */
export class DingTalkBot {
  private webhook: string;
  private secret?: string;

  constructor(webhook: string, secret?: string) {
    this.webhook = webhook;
    this.secret = secret;
  }

  /**
   * 生成签名
   */
  private sign(timestamp: number): string {
    if (!this.secret) {
      return '';
    }
    const stringToSign = `${timestamp}\n${this.secret}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(stringToSign);
    return encodeURIComponent(hmac.digest('base64'));
  }

  /**
   * 发送Markdown格式的消息到钉钉
   */
  public async send(title: string, markdownText: string): Promise<boolean> {
    // 如果没有配置Webhook，直接跳过
    if (!this.webhook) {
      console.warn('钉钉Webhook未配置，跳过消息发送');
      return false;
    }

    try {
      // 准备签名 (如果有secret)
      const timestamp = Date.now();
      let url = this.webhook;

      if (this.secret) {
        const sign = this.sign(timestamp);
        url = `${this.webhook}&timestamp=${timestamp}&sign=${sign}`;
      }

      // 准备消息内容
      const payload = {
        msgtype: 'markdown',
        markdown: {
          title: title,
          text: markdownText,
        }
      };

      // 发送请求
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5秒超时
      });

      // 检查响应
      if (response.data.errcode === 0) {
        return true;
      } else {
        console.error('钉钉消息发送失败:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('钉钉消息发送出错:', error.message);
      return false;
    }
  }

  /**
   * 发送错误报警
   * @param error 错误对象
   * @param req Express请求对象
   */
  public async sendErrorAlert(error: any, req?: any): Promise<boolean> {
    // 如果没有配置，直接跳过
    if (!this.webhook) {
      return false;
    }

    const hostname = os.hostname();
    const env = process.env.NODE_ENV || 'development';
    const title = `服务器错误报警 (${env})`;

    // 提取请求信息
    let requestInfo = '无请求信息';
    if (req && req.method && req.originalUrl) {
      requestInfo = `${req.method} ${req.originalUrl}`;
      if (req.ip) {
        requestInfo += ` (IP: ${req.ip})`;
      }
    }

    // 限制堆栈跟踪长度
    const stack = error.stack || '无堆栈信息';
    const trimmedStack = stack.length > 1500 
      ? stack.substring(0, 1500) + '\n... (已截断)' 
      : stack;

    // 构建Markdown格式的消息
    const markdown = `
### 🚨 服务器错误报警

**环境:** ${env}
**主机:** ${hostname}
**时间:** ${new Date().toISOString()}
**请求:** ${requestInfo}

**错误类型:** ${error.name || '未知错误类型'}
**错误消息:** ${error.message || '无错误消息'}

**堆栈跟踪:**
\`\`\`
${trimmedStack}
\`\`\`
    `;

    // 异步发送，不阻塞当前请求处理
    return await this.send(title, markdown);
  }
}

// 创建单例实例
export const dingTalkBot = DINGTALK_WEBHOOK 
  ? new DingTalkBot(DINGTALK_WEBHOOK, DINGTALK_SECRET)
  : null; 