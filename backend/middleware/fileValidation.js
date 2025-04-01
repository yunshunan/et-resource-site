const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// 文件大小限制 (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// 确保上传目录存在
const ensureUploadsDir = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureUploadsDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成一个唯一的文件名，防止文件名冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 创建Multer实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// 错误处理中间件
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `文件大小不能超过${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    return res.status(400).json({
      success: false,
      message: '文件上传错误: ' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// 检查文件安全性
const scanFileForThreats = (req, res, next) => {
  // 在实际环境中，这里可以集成防病毒扫描或其他安全检测API
  // 这里简单模拟一个安全检查过程
  if (req.file) {
    // 检查文件签名或特征
    const filePath = req.file.path;
    // 读取文件头部字节，检查文件签名
    // 这里省略实际实现...
    
    // 设置文件URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    req.fileUrl = `${baseUrl}/uploads/${path.basename(req.file.path)}`;
  }
  next();
};

module.exports = {
  upload,
  handleMulterError,
  scanFileForThreats,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
}; 