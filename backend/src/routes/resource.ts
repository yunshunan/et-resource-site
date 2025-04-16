import express from 'express';
import { 
  getResources, 
  createResource, 
  getResourceById,
  deleteResource, // 导入删除资源的控制器函数
  createComment, // 导入评论控制器
  getComments,   // 导入评论控制器
  rateResource,  // 导入评分控制器
  getUserResources // 导入获取用户资源控制器
} from '../controllers/resource'; // 假设控制器都在 resourceController
import { authenticate } from '../middleware/authenticate'; // Corrected import path
// import { authorizeAdmin } from '../middlewares/auth'; // Removed unused import

const router = express.Router();

/**
 * @route   GET /api/resources
 * @desc    获取资源列表 (支持搜索、过滤、排序、分页)
 * @access  Public
 */
router.get('/', getResources);

/**
 * @route   POST /api/resources
 * @desc    创建新资源
 * @access  Private (需要认证)
 */
router.post('/', authenticate, createResource);

/**
 * @route   GET /api/resources/user
 * @desc    获取当前用户上传的资源列表
 * @access  Private (需要认证)
 */
router.get('/user', authenticate, getUserResources);

/**
 * @route   GET /api/resources/:id
 * @desc    获取指定ID的资源详情
 * @access  Public
 */
router.get('/:id', getResourceById);

/**
 * @route   DELETE /api/resources/:id
 * @desc    删除指定ID的资源
 * @access  Private (需要认证，且通常需要检查是否为资源所有者)
 */
router.delete('/:id', authenticate, deleteResource);

// --- 评论相关 --- 

/**
 * @route   POST /api/resources/:id/comments
 * @desc    为资源添加评论
 * @access  Private (需要认证)
 */
router.post('/:id/comments', authenticate, createComment);

/**
 * @route   GET /api/resources/:id/comments
 * @desc    获取资源的评论列表
 * @access  Public
 */
router.get('/:id/comments', (req, res, next) => {
    console.log(`>>> GET /api/resources/${req.params.id}/comments route hit! Time: ${new Date().toISOString()}`); // 添加日志
    next(); // 继续传递给 getComments 控制器
}, getComments);

// --- 评分相关 --- 

/**
 * @route   POST /api/resources/:id/rate
 * @desc    为资源提交评分
 * @access  Private (需要认证)
 */
router.post('/:id/rate', authenticate, rateResource);

export default router; 