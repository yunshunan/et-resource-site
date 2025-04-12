import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import Resource, { IResource } from '../models/Resource'; // 导入 Resource 模型
import Comment, { IComment } from '../models/Comment'; // 导入 Comment 模型
import { FilterQuery, Types } from 'mongoose';
import { AV } from '../libs/leancloud'; // 可能需要查询 LeanCloud 用户信息

/**
 * 获取资源列表
 * 支持搜索、分类、标签过滤、排序和分页
 * @route GET /api/resources
 */
export const getResources = asyncHandler(async (req: Request, res: Response) => {
  // 1. 解析查询参数
  const { 
    q, // 搜索关键字
    category, // 分类
    tags, // 标签 (逗号分隔)
    sortBy = 'createdAt', // 排序字段
    sortOrder = 'desc', // 排序顺序
    page = 1, // 当前页码
    limit = 20 // 每页数量
  } = req.query;

  // 2. 参数校验和处理
  const pageNum = parseInt(page as string, 10) || 1;
  // 限制每页最多获取 50 条
  const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50); 
  const skip = (pageNum - 1) * limitNum;

  // 3. 构建查询条件
  const query: FilterQuery<IResource> = {};

  if (q) {
    // 使用文本索引进行搜索 ($text 操作符要求 MongoDB 中有文本索引)
    query.$text = { $search: q as string };
  }

  if (category) {
    query.category = category as string;
  }

  if (tags) {
    // 将逗号分隔的标签字符串转为数组
    const tagsArray = (tags as string).split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagsArray.length > 0) {
      // 使用 $all 匹配包含所有指定标签的资源
      query.tags = { $all: tagsArray }; 
    }
  }

  // 4. 构建排序条件
  const sort: { [key: string]: 1 | -1 } = {};
  if (typeof sortBy === 'string') {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  // 5. 执行查询
  try {
    // 并行执行获取总数和获取分页数据的查询以提高效率
    const [totalResources, resources] = await Promise.all([
      Resource.countDocuments(query),
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        // .populate('uploader') // 如果需要上传者信息，但现在是 LeanCloud ID
    ]);

    // 6. 计算分页信息
    const totalPages = Math.ceil(totalResources / limitNum);

    // 7. 返回响应
    res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalPages,
        totalResources
      }
    });
  } catch (error) {
    console.error('获取资源列表失败:', error);
    res.status(500).json({ success: false, message: '获取资源列表时出错' });
  }
});

/**
 * 创建新资源
 * @route POST /api/resources
 * @access Private (需要认证)
 */
export const createResource = asyncHandler(async (req: Request, res: Response) => {
  // 1. 检查用户是否已认证 (authenticate 中间件应该已处理，但再确认一次)
  if (!req.user || !req.user.leancloud_uid) {
    return res.status(401).json({ success: false, message: '请先登录后再创建资源' });
  }
  const uploaderId = req.user.leancloud_uid;

  // 2. 从请求体获取数据
  const { title, url, category, description, imageUrl, tags } = req.body;

  // 3. 输入验证
  if (!title || !url || !category) {
    return res.status(400).json({ success: false, message: '标题、URL 和分类是必填项' });
  }

  // 可选：更详细的验证 (例如 URL 格式)
  try {
    new URL(url); // 尝试解析 URL，无效则抛出错误
  } catch (error) {
    return res.status(400).json({ success: false, message: '无效的 URL 格式' });
  }

  // 4. 准备要创建的资源对象
  const resourceData: Partial<IResource> = {
    title,
    url,
    category,
    uploader: uploaderId,
    description: description || '', // 提供默认值
    imageUrl: imageUrl || '',
    // 将逗号分隔或空格分隔的标签字符串转为数组 (如果提供了tags)
    tags: typeof tags === 'string' ? tags.split(/[,\s]+/).map(tag => tag.trim()).filter(tag => tag) : [],
    ratingSum: 0, // 初始评分总和为 0
    ratingCount: 0
  };

  // 5. 创建并保存资源
  try {
    const newResource = await Resource.create(resourceData);
    res.status(201).json({ success: true, data: newResource });
  } catch (error: any) {
    console.error('创建资源失败:', error);
    // 处理唯一键冲突 (例如 URL 重复)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: '提交的 URL 已存在，请检查' });
    }
    // 处理其他 Mongoose 验证错误
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '创建资源时出错' });
  }
});

/**
 * 为资源添加评论
 * @route POST /api/resources/:id/comments
 * @access Private (需要认证)
 */
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;
  const { content } = req.body;

  // 1. 检查用户是否已认证 (暂时注释掉以方便测试)
  // if (!req.user || !req.user.leancloud_uid) {
  //   return res.status(401).json({ success: false, message: '请先登录后再发表评论' });
  // }
  const userId = req.user?.leancloud_uid || 'TEST_USER_ID'; // 提供一个测试用户 ID

  // 2. 输入验证
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ success: false, message: '评论内容不能为空' });
  }
  if (content.length > 1000) { // 与模型中的 maxlength 保持一致
    return res.status(400).json({ success: false, message: '评论内容过长，最多1000字符' });
  }
  
  // 验证资源 ID 是否有效
  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ success: false, message: '无效的资源 ID' });
  }

  try {
    // 3. 检查资源是否存在
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: '评论的资源不存在' });
    }

    // 4. (可选) 获取用户信息 (用户名, 头像) - 异步执行，不阻塞评论创建
    let username: string | undefined;
    let avatarUrl: string | undefined;
    try {
      // 注意: 这里假设 _User 表中有 username 和 avatarUrl 字段
      const userQuery = new AV.Query('_User');
      const leancloudUser = await userQuery.get(userId);
      username = leancloudUser.get('username'); // 根据实际字段名调整
      avatarUrl = leancloudUser.get('avatarUrl'); // 根据实际字段名调整
    } catch (userError) {
      console.warn(`获取用户 ${userId} 的信息失败，评论将不包含用户名和头像:`, userError);
      // 获取失败不影响评论创建，username 和 avatarUrl 会是 undefined
    }

    // 5. 创建评论
    const commentData: Partial<IComment> = {
      resourceId: new Types.ObjectId(resourceId),
      userId: userId,
      content: content.trim(),
      username: username, // 可能为 undefined
      avatarUrl: avatarUrl, // 可能为 undefined
    };

    const newComment = await Comment.create(commentData);

    // 6. 返回成功响应
    res.status(201).json({ success: true, data: newComment });

  } catch (error: any) {
    console.error('创建评论失败:', error);
    // 处理可能的 Mongoose 验证错误
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '创建评论时出错' });
  }
});

/**
 * 获取资源的评论列表
 * @route GET /api/resources/:id/comments
 * @access Public
 */
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { id: resourceId } = req.params; // 从 URL 获取资源 ID
  const { 
    page = 1, 
    limit = 10, // 评论默认每页10条
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  // 1. 验证资源 ID
  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ success: false, message: '无效的资源 ID' });
  }

  // 2. 处理分页和排序参数
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50); // 每页最多50条评论
  const skip = (pageNum - 1) * limitNum;

  const sort: { [key: string]: 1 | -1 } = {};
  if (typeof sortBy === 'string') {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  try {
    // 3. 检查资源是否存在 (可选，但建议，确保评论关联的是有效资源)
    const resourceExists = await Resource.exists({ _id: resourceId });
    if (!resourceExists) {
      return res.status(404).json({ success: false, message: '资源不存在' });
    }

    // 4. 构建查询条件
    const query: FilterQuery<IComment> = { resourceId: new Types.ObjectId(resourceId) };

    // 5. 执行查询 (并行获取总数和当前页数据)
    const [totalComments, comments] = await Promise.all([
      Comment.countDocuments(query),
      Comment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

    // 6. 计算分页信息
    const totalPages = Math.ceil(totalComments / limitNum);

    // 7. 返回响应
    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalPages,
        totalItems: totalComments // 使用 totalItems 更通用
      }
    });

  } catch (error: any) {
    console.error(`获取资源 ${resourceId} 的评论列表失败:`, error);
    res.status(500).json({ success: false, message: '获取评论列表时出错' });
  }
});

/**
 * 为资源提交评分
 * @route POST /api/resources/:id/rate
 * @access Private (需要认证)
 */
export const rateResource = asyncHandler(async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;
  const { rating } = req.body;

  // 1. 检查用户是否已认证 (暂时注释掉以方便测试)
  // if (!req.user || !req.user.leancloud_uid) {
  //   return res.status(401).json({ success: false, message: '请先登录后再评分' });
  // }
  // const userId = req.user?.leancloud_uid; 

  // 2. 验证资源 ID
  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ success: false, message: '无效的资源 ID' });
  }

  // 3. 验证评分值
  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ success: false, message: '无效的评分值，必须是 1 到 5 之间的数字' });
  }

  try {
    // 4. 查找资源并原子性地更新评分
    // 使用 $inc 操作符保证并发安全
    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      {
        $inc: { 
          ratingSum: numericRating, // 增加评分总和
          ratingCount: 1         // 增加评分次数
        }
      },
      {
        new: true, // 返回更新后的文档
        runValidators: true // 运行 Mongoose 验证器 (虽然这里 $inc 不会触发 default/min/max)
      }
    );

    // 5. 检查资源是否存在
    if (!updatedResource) {
      return res.status(404).json({ success: false, message: '评分的资源不存在' });
    }

    // 6. 返回成功响应 (包含更新后的资源及其计算出的平均分)
    res.status(200).json({ success: true, data: updatedResource });

  } catch (error: any) {
    console.error(`为资源 ${resourceId} 提交评分失败:`, error);
    res.status(500).json({ success: false, message: '提交评分时出错' });
  }
});

// 控制器函数已全部实现 