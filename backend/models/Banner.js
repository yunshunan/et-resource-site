const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请填写轮播图标题'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请填写轮播图描述'],
    trim: true,
    maxlength: [200, '描述不能超过200个字符']
  },
  imageUrl: {
    type: String,
    required: [true, '请上传轮播图']
  },
  link: {
    type: String,
    required: [true, '请填写链接地址']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Banner', BannerSchema); 