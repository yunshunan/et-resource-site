const winston = require('winston');
const path = require('path');

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据当前环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// 自定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 定义日志存储位置
const transports = [
  // 将所有日志保存到combined.log文件
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
  }),
  // 将error级别的日志单独保存到error.log文件
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  // 开发环境下，将日志输出到控制台
  new winston.transports.Console(),
];

// 创建日志记录器
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger; 