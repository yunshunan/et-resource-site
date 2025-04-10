# 认证系统文档

## 系统概述

ET资源网站采用了Firebase+LeanCloud双重认证系统，结合了两个平台的优势：

- **Firebase**：提供强大的用户认证机制，包括邮箱/密码、社交媒体登录等
- **LeanCloud**：提供简单的数据存储和云函数，便于快速开发

这种混合认证架构允许我们在前端使用Firebase的认证SDK，同时在后端使用LeanCloud进行数据存储和业务逻辑处理。

## 技术架构

### 前端技术栈

- Vue 3 + Composition API
- Pinia (状态管理)
- Firebase Auth SDK
- Axios (API请求)

### 后端技术栈

- Express.js + TypeScript
- Firebase Admin SDK
- LeanCloud JavaScript SDK
- JWT (JSON Web Tokens)

## 认证流程

### 注册流程

1. 用户在前端填写注册表单（邮箱/密码）
2. 前端调用Firebase Auth SDK创建用户
3. 用户创建成功后，获取Firebase ID令牌
4. 将ID令牌发送到后端进行验证
5. 后端验证ID令牌，并在LeanCloud创建对应用户记录
6. 后端生成JWT令牌，返回给前端
7. 前端保存JWT令牌，并更新认证状态

### 登录流程

1. 用户在前端填写登录表单（邮箱/密码）
2. 前端调用Firebase Auth SDK进行身份验证
3. 验证成功后，获取Firebase ID令牌
4. 将ID令牌发送到后端进行验证
5. 后端验证ID令牌，并查询LeanCloud中的用户信息
6. 后端生成JWT令牌，返回给前端
7. 前端保存JWT令牌，并更新认证状态

### 会话维护

- 前端使用localStorage存储JWT令牌
- 每次页面加载时，检查localStorage中的令牌并初始化认证状态
- Firebase Auth SDK监听认证状态变化，自动处理用户登录/登出
- API请求自动附加Authorization头部，包含JWT令牌

## API接口

### 注册

- **URL**: `/api/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "user": {
      "email": "user@example.com",
      "firebase_uid": "firebase_user_id"
    },
    "token": "jwt_token_here"
  }
  ```

### 登录

- **URL**: `/api/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "user": {
      "email": "user@example.com",
      "firebase_uid": "firebase_user_id"
    },
    "token": "jwt_token_here"
  }
  ```

### 验证Firebase令牌

- **URL**: `/api/auth/verify-token`
- **方法**: POST
- **请求体**:
  ```json
  {
    "idToken": "firebase_id_token_here"
  }
  ```
- **响应**:
  ```json
  {
    "user": {
      "email": "user@example.com",
      "firebase_uid": "firebase_user_id"
    },
    "token": "jwt_token_here"
  }
  ```

## 安全考虑

### 密钥管理

- 所有密钥和敏感配置存储在环境变量中
- Firebase Service Account凭证存储在`.gitignore`中的配置文件内
- JWT密钥使用强随机生成的字符串

### 安全防护

- 使用Firebase Auth提供的密码哈希和安全存储
- 实施JWT过期机制，默认7天
- 在LeanCloud中使用ACL控制用户访问权限
- 使用HTTPS确保传输安全
- 实施API请求率限制防止暴力攻击

## 错误处理

- 前端提供用户友好的错误消息
- 后端记录详细错误日志
- 对敏感操作记录安全审计日志
- 使用Sentry进行错误监控和报告

## 开发和测试

### 环境设置

1. 复制`.env.example`到`.env`并填入适当的值
2. 从Firebase控制台获取Service Account凭证
3. 确保LeanCloud应用正确配置

### 测试认证

1. 使用Postman或类似工具测试API端点
2. 使用Jest进行单元测试和集成测试
3. 手动测试前端认证流程

## 部署注意事项

- 确保所有环境变量正确设置
- 验证Firebase和LeanCloud配置
- 实施适当的CORS设置
- 配置HTTPS和安全头部
- 设置适当的缓存控制 