const mongoose = require('mongoose');
const { isURL } = require('validator');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请填写资源标题'],
    trim: true,
    minlength: [3, '标题至少需要3个字符'],
    maxlength: [100, '标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请填写资源描述'],
    trim: true,
    minlength: [10, '描述至少需要10个字符'],
    maxlength: [500, '描述不能超过500个字符']
  },
  category: {
    type: String,
    required: [true, '请选择资源分类'],
    enum: {
      values: ['办公资源', '设计资源', '营销资源', '教育资源', '开发资源', '其他'],
      message: '{VALUE}不是有效的资源分类'
    }
  },
  imageUrl: {
    type: String,
    required: [true, '请上传资源封面图'],
    validate: {
      validator: function(v) {
        return isURL(v, { require_protocol: true });
      },
      message: '请提供有效的图片URL'
    }
  },
  downloadLink: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return v === '' || isURL(v, { require_protocol: true });
      },
      message: '请提供有效的下载链接URL'
    }
  },
  fileSize: {
    type: String,
    default: '',
    maxlength: [20, '文件大小格式不正确']
  },
  fileType: {
    type: String,
    default: '',
    maxlength: [50, '文件类型格式不正确']
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: '标签不能超过10个'
    }
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, '查看次数不能为负数']
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, '下载次数不能为负数']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '资源必须关联用户']
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '评分必须关联用户']
    },
    value: {
      type: Number,
      required: [true, '请提供评分值'],
      min: [1, '评分最小为1'],
      max: [5, '评分最大为5']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'reported'],
      message: '{VALUE}不是有效的资源状态'
    },
    default: 'active'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ResourceSchema.virtual('favoriteCount').get(function() {
  return this.favorites.length;
});

ResourceSchema.virtual('ratingCount').get(function() {
  return this.ratings.length;
});

ResourceSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

ResourceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

ResourceSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const total = this.ratings.reduce((sum, rating) => sum + rating.value, 0);
  this.averageRating = parseFloat((total / this.ratings.length).toFixed(1));
};

ResourceSchema.methods.isFavoritedBy = function(userId) {
  return this.favorites.some(id => id.toString() === userId.toString());
};

ResourceSchema.methods.isRatedBy = function(userId) {
  return this.ratings.some(rating => rating.user.toString() === userId.toString());
};

ResourceSchema.methods.getUserRating = function(userId) {
  const userRating = this.ratings.find(rating => rating.user.toString() === userId.toString());
  return userRating ? userRating.value : null;
};

module.exports = mongoose.model('Resource', ResourceSchema); 