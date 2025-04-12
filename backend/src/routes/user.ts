import express from 'express';
import { updateUserRole } from '../controllers/user';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = express.Router();

/**
 * @route   PUT /api/users/:id/role
 * @desc    更新用户角色（仅管理员可操作）
 * @access  Private/Admin
 */
// 根据环境变量决定是否应用认证中间件
const middlewares = [];
if (process.env.NODE_ENV !== 'development' || process.env.BYPASS_AUTH !== 'true') {
  middlewares.push(authenticate);
}
if (process.env.NODE_ENV !== 'development' || process.env.BYPASS_ADMIN_AUTH !== 'true') {
  middlewares.push(authorizeAdmin);
}

router.put('/:id/role', ...middlewares, updateUserRole);

export default router; 