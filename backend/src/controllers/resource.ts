import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import Resource, { IResource } from '../models/Resource'; // 导入 Resource 模型
import Comment, { IComment } from '../models/Comment'; // 导入 Comment 模型
import { FilterQuery, Types } from 'mongoose';
import { AV } from '../libs/leancloud'; // 可能需要查询 LeanCloud 用户信息
import { AuthRequest } from '../types/auth'; // 导入 AuthRequest 类型

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
export const createResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  // 1. 检查用户
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: '请先登录后再创建资源' });
  }
  const uploaderId = req.user.userId; // 正确使用 JWT 结构

  // 2. 从请求体获取数据 (修正：接收 downloadLink, imageUrl, fileSize, fileType, 移除 url)
  const { 
    title, 
    category, 
    description, 
    imageUrl,      // 封面图片 URL
    downloadLink,  // 资源文件下载链接
    tags,          // 标签数组 (前端已处理好)
    fileSize,      // 文件大小 (来自前端)
    fileType       // 文件类型 (来自前端)
  } = req.body;

  // 3. 输入验证 (修正：验证 downloadLink 和 imageUrl)
  if (!title || !downloadLink || !category || !imageUrl) { 
    // 将 imageUrl 也视为必填项，如果需要
    return res.status(400).json({ 
      success: false, 
      message: '标题、下载链接、封面图片和分类是必填项' 
    });
  }

  // 4. 准备要创建的资源对象 
  const resourceData: Partial<IResource> = {
    title: title.trim(), 
    category,
    uploader: uploaderId,
    description: description?.trim() || '', 
    imageUrl: imageUrl, 
    // 将 downloadLink 赋值给模型的 url 字段
    url: downloadLink, 
    tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim()) : [], 
    fileSize: fileSize || '', 
    fileType: fileType || '', 
    ratingSum: 0,
    ratingCount: 0
  };

  // 5. 创建并保存资源
  try {
    const newResource = await Resource.create(resourceData);
    // 返回包含完整信息的成功响应
    res.status(201).json({ success: true, data: newResource }); 
  } catch (error: any) {
    console.error('创建资源失败:', error);
    if (error.code === 11000) {
      // 检查哪个键冲突，更精确提示
      const conflictingKey = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `提交的 ${conflictingKey} 已存在，请检查` });
    }
    if (error.name === 'ValidationError') {
      // 提取更具体的验证错误信息
      const messages = Object.values(error.errors).map((el: any) => el.message);
      return res.status(400).json({ success: false, message: `数据验证失败: ${messages.join(', ')}`, errors: error.errors });
    }
    res.status(500).json({ success: false, message: '创建资源时出错' });
  }
});

/**
 * 为资源添加评论
 * @route POST /api/resources/:id/comments
 * @access Private (需要认证)
 */
export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: resourceId } = req.params;
  const { content } = req.body;
  
  console.log('收到评论请求 - 参数:', {
    resourceId,
    requestBody: req.body,
    user: req.user
  });

  // 1. 检查用户是否已认证 (authenticate 中间件已处理，但需要获取用户ID)
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: '请先登录后再发表评论' });
  }
  const userId = req.user.userId; // 正确使用 JWT 结构中的 userId

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
      avatarUrl = leancloudUser.get('avatar')?.url(); // 根据实际字段名调整
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

    console.log('准备创建评论:', commentData);
    const newComment = await Comment.create(commentData);
    console.log('评论创建成功:', newComment);

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
export const rateResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: resourceId } = req.params;
  const { rating } = req.body;

  // 1. 检查用户是否已认证
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: '请先登录后再评分' });
  }
  const userId = req.user.userId; // 正确使用 JWT 结构

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

/**
 * 获取当前用户上传的资源列表
 * @route GET /api/resources/user
 * @access Private (需要认证)
 */
export const getUserResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log(`[getUserResources] Entered. req.user:`, req.user); // Log req.user at the beginning
  // 1. 检查用户是否已认证
  if (!req.user || !req.user.userId) {
    console.error('[getUserResources] Authentication check failed or userId missing in req.user');
    return res.status(401).json({ success: false, message: '请先登录' });
  }
  const userId = req.user.userId; // 正确使用 JWT 结构

  // 2. 解析分页参数
  const { 
    page = 1, 
    limit = 10,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50); // 每页最多50条
  const skip = (pageNum - 1) * limitNum;

  // 3. 构建排序条件
  const sort: { [key: string]: 1 | -1 } = {};
  if (typeof sortBy === 'string') {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  try {
    // 4. 查询该用户上传的资源
    const query = { uploader: userId };
    
    // 5. 并行执行查询总数和分页数据
    const [totalResources, resources] = await Promise.all([
      Resource.countDocuments(query),
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
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
    console.error('获取用户资源列表失败:', error);
    res.status(500).json({ success: false, message: '获取用户资源列表时出错' });
  }
});

/**
 * 删除指定 ID 的资源
 * @route DELETE /api/resources/:id
 * @access Private (需要认证，且需要是资源所有者)
 */
export const deleteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: resourceId } = req.params;
  
  // 1. 验证用户是否登录 (虽然 authenticate 中间件已处理，但获取 uid 需要)
  if (!req.user || !req.user.userId) {
    // 这个情况理论上不应该发生，因为 authenticate 会先拦住
    return res.status(401).json({ success: false, message: '需要认证' });
  }
  const userId = req.user.userId; // 正确使用 JWT 结构
  
  // 2. 验证资源 ID 是否有效
  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ success: false, message: '无效的资源 ID' });
  }

  try {
    // 3. 查找资源
    const resource = await Resource.findById(resourceId);

    // 4. 检查资源是否存在
    if (!resource) {
      return res.status(404).json({ success: false, message: '未找到要删除的资源' });
    }

    // 5. 权限检查：确保当前用户是资源的上传者
    if (resource.uploader !== userId) {
      return res.status(403).json({ success: false, message: '无权删除此资源' });
    }

    // 6. 执行删除操作
    await Resource.findByIdAndDelete(resourceId);

    // 7. 返回成功响应 (204 No Content 通常用于 DELETE 成功)
    res.status(204).send();

  } catch (error: any) {
    console.error(`删除资源 ${resourceId} 失败:`, error);
    res.status(500).json({ success: false, message: '删除资源时出错' });
  }
});

/**
 * 获取指定 ID 的资源详情
 * @route GET /api/resources/:id
 * @access Public
 */
export const getResourceById = asyncHandler(async (req: Request, res: Response) => {
  const { id: resourceId } = req.params;

  // 1. 验证资源 ID 是否有效
  if (!Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({ success: false, message: '无效的资源 ID' });
  }

  try {
    // 2. 查找资源
    // 可以考虑 populate 'uploader' 如果需要更详细的上传者信息
    const resource = await Resource.findById(resourceId);

    // 3. 检查资源是否存在
    if (!resource) {
      return res.status(404).json({ success: false, message: '未找到指定资源' });
    }

    // 4. 返回资源数据
    res.status(200).json({ success: true, data: resource });

  } catch (error: any) {
    console.error(`获取资源 ${resourceId} 详情失败:`, error);
    res.status(500).json({ success: false, message: '获取资源详情时出错' });
  }
});

// 控制器函数已全部实现 