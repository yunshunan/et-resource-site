import mongoose, { Schema, Document, Types } from 'mongoose';

// 定义资源文档的接口
export interface IResource extends Document {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  category: string;
  tags?: string[];
  fileSize?: string;
  fileType?: string;
  ratingSum?: number; // 评分总和
  ratingCount: number;
  uploader: string; // 存储 LeanCloud User ObjectId (字符串)
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
}

// 创建 Mongoose Schema
const ResourceSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    url: { type: String, required: true, trim: true, unique: true }, // URL 设为唯一
    imageUrl: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    fileSize: { type: String },
    fileType: { type: String },
    ratingSum: { type: Number, default: 0, min: 0 }, // 评分总和
    ratingCount: { type: Number, default: 0, min: 0 },
    // 直接存储 LeanCloud _User 表的 objectId (字符串类型)
    uploader: { type: String, required: true },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    toJSON: { virtuals: true }, // 确保虚拟字段被包含在 toJSON 输出中
    toObject: { virtuals: true } // 确保虚拟字段被包含在 toObject 输出中
  }
);

// 添加虚拟字段计算平均分
ResourceSchema.virtual('averageRating').get(function (this: IResource) {
  // 如果 ratingCount 为 0，或者 ratingSum 不存在，则平均分为 0
  if (!this.ratingCount || !this.ratingSum) {
    return 0;
  }
  // 确保 ratingSum 有效再进行计算
  const sum = this.ratingSum || 0;
  const count = this.ratingCount;
  // 保留一位小数
  return parseFloat((sum / count).toFixed(1));
});

// 添加索引以优化查询
ResourceSchema.index({ title: 'text', description: 'text' }); // 文本索引，用于搜索
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ uploader: 1 });
ResourceSchema.index({ averageRating: -1 }); // 可以按平均分排序 (如果需要)
ResourceSchema.index({ ratingCount: -1 }); // 也可以按评分人数排序
ResourceSchema.index({ createdAt: -1 });

// 创建并导出 Mongoose 模型
export default mongoose.model<IResource>('Resource', ResourceSchema); 