const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请填写新闻标题'],
    trim: true,
    maxlength: [200, '标题不能超过200个字符']
  },
  summary: {
    type: String,
    required: [true, '请填写新闻摘要'],
    trim: true,
    maxlength: [500, '摘要不能超过500个字符']
  },
  content: {
    type: String,
    required: [true, '请填写新闻内容']
  },
  imageUrl: {
    type: String,
    required: [true, '请上传新闻封面图']
  },
  tags: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
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

module.exports = mongoose.model('News', NewsSchema); 