const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请填写资源标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请填写资源描述'],
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  category: {
    type: String,
    required: [true, '请选择资源分类'],
    enum: ['办公资源', '设计资源', '营销资源', '教育资源', '开发资源', '其他']
  },
  imageUrl: {
    type: String,
    required: [true, '请上传资源封面图']
  },
  downloadLink: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema); 