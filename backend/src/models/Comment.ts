import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * 评论接口定义
 */
export interface IComment extends Document {
  resourceId: Types.ObjectId; // 关联的资源 ID (Mongoose ObjectId)
  userId: string;            // 发表评论的用户 ID (LeanCloud ObjectId - String)
  username?: string;         // 发表评论的用户名 (冗余存储，可选)
  avatarUrl?: string;        // 发表评论的用户头像 (冗余存储，可选)
  content: string;           // 评论内容
  createdAt?: Date;          // 创建时间 (Mongoose 自动管理)
  updatedAt?: Date;          // 更新时间 (Mongoose 自动管理)
}

/**
 * 评论 Schema 定义
 */
const CommentSchema: Schema<IComment> = new Schema(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource', // 关联到 Resource 模型
      required: true,
      index: true, // 为资源 ID 添加索引，加速查询
    },
    userId: {
      type: String,
      required: true,
      index: true, // 为用户 ID 添加索引
    },
    username: { // 可选，用于前端直接显示，避免再次查询 LeanCloud
      type: String,
      required: false, // 设为可选，如果获取不到也不阻塞
    },
    avatarUrl: { // 可选
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,     // 评论至少1个字符
      maxlength: 1000,  // 评论最多1000字符 (可调整)
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

// 创建并导出 Comment 模型
const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment; 