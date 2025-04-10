import { Router } from 'express';
import { 
  register, 
  login, 
  verifyFirebaseToken, 
  verifyLeanCloudToken,
  leanCloudLogin,
  leanCloudRegister
} from '../controllers/auth';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 注册新用户
 *     description: 创建一个新的用户账号，同时在Firebase和LeanCloud中注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 无效的输入
 *       409:
 *         description: 用户已存在
 */
router.post('/register', asyncHandler(register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 验证用户凭证并返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 无效的输入
 *       401:
 *         description: 凭证无效
 *       404:
 *         description: 用户不存在
 */
router.post('/login', asyncHandler(login));

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     summary: 验证Firebase ID令牌
 *     description: 验证Firebase ID令牌并返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 验证成功
 *       400:
 *         description: 无效的输入
 *       401:
 *         description: 令牌无效
 */
router.post('/verify-token', asyncHandler(verifyFirebaseToken));

/**
 * @swagger
 * /api/auth/verify-leancloud-token:
 *   post:
 *     summary: 验证LeanCloud Session令牌
 *     description: 验证LeanCloud会话令牌并返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionToken
 *             properties:
 *               sessionToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 验证成功
 *       400:
 *         description: 无效的输入
 *       401:
 *         description: 令牌无效
 */
router.post('/verify-leancloud-token', asyncHandler(verifyLeanCloudToken));

/**
 * @swagger
 * /api/auth/leancloud-register:
 *   post:
 *     summary: 使用LeanCloud注册新用户
 *     description: 通过LeanCloud创建一个新的用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 无效的输入
 *       409:
 *         description: 用户已存在
 */
router.post('/leancloud-register', asyncHandler(leanCloudRegister));

/**
 * @swagger
 * /api/auth/leancloud-login:
 *   post:
 *     summary: 使用LeanCloud登录
 *     description: 使用LeanCloud验证用户凭证并返回JWT令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       400:
 *         description: 无效的输入
 *       401:
 *         description: 凭证无效
 *       404:
 *         description: 用户不存在
 */
router.post('/leancloud-login', asyncHandler(leanCloudLogin));

export default router; 