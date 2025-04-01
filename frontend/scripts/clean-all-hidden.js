/**
 * macOS隐藏文件清理工具（增强版）
 * 此脚本会递归搜索项目目录，删除所有._开头的macOS元数据文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
// 需要排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'coverage'];

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// 统计数据
let stats = {
  scannedDirs: 0,
  scannedFiles: 0,
  deletedFiles: 0
};

console.log(`${colors.blue}=== macOS隐藏文件清理工具 (增强版) ===${colors.reset}`);
console.log(`开始扫描目录: ${ROOT_DIR}\n`);

/**
 * 递归扫描目录并删除隐藏文件
 * @param {string} dirPath 要扫描的目录路径
 */
function cleanDirectory(dirPath) {
  // 读取目录内容
  try {
    stats.scannedDirs++;
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const isDirectory = fs.statSync(itemPath).isDirectory();
      
      // 如果是目录，检查是否应该排除
      if (isDirectory) {
        if (EXCLUDE_DIRS.includes(item)) {
          console.log(`${colors.yellow}跳过排除目录: ${itemPath}${colors.reset}`);
          continue;
        }
        // 递归处理子目录
        cleanDirectory(itemPath);
      } else {
        stats.scannedFiles++;
        // 检查文件名是否以._开头
        if (item.startsWith('._')) {
          try {
            fs.unlinkSync(itemPath);
            console.log(`${colors.green}已删除: ${itemPath}${colors.reset}`);
            stats.deletedFiles++;
          } catch (err) {
            console.error(`${colors.red}删除失败: ${itemPath} - ${err.message}${colors.reset}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`${colors.red}读取目录失败: ${dirPath} - ${err.message}${colors.reset}`);
  }
}

// 启动时间
const startTime = Date.now();

// 开始清理
cleanDirectory(ROOT_DIR);

// 计算耗时
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

// 打印结果报告
console.log(`\n${colors.blue}=== 清理完成 ===${colors.reset}`);
console.log(`扫描目录数: ${stats.scannedDirs}`);
console.log(`扫描文件数: ${stats.scannedFiles}`);
console.log(`删除隐藏文件数: ${stats.deletedFiles}`);
console.log(`总耗时: ${duration}秒`);

// 添加到package.json的清理命令示例
console.log(`\n${colors.yellow}提示: 可以将此命令添加到package.json中:${colors.reset}`);
console.log(`"scripts": {
  "clean:macos": "node scripts/clean-all-hidden.js",
  ...
}`);

// 在Git预提交钩子中添加的建议
console.log(`\n${colors.yellow}建议: 在.git/hooks/pre-commit中添加以下内容以防止提交隐藏文件:${colors.reset}`);
console.log(`#!/bin/sh
# 检查并清理macOS隐藏文件
node scripts/clean-all-hidden.js

# 如果有隐藏文件被清理，则阻止提交
if [ $? -eq 1 ]; then
  echo "发现并清理了macOS隐藏文件，请重新添加文件并提交"
  exit 1
fi
`); 