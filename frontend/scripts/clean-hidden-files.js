/**
 * 清理隐藏文件脚本
 * 用于测试前删除macOS生成的隐藏文件，防止其干扰测试运行
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

/**
 * 递归扫描目录并删除所有匹配的隐藏文件
 * @param {string} directory 要扫描的目录
 * @returns {Promise<number>} 删除的文件数量
 */
async function cleanHiddenFiles(directory) {
  let deletedCount = 0;
  
  try {
    // 读取目录内容
    const entries = await readdir(directory, { withFileTypes: true });
    
    // 处理目录中的每个条目
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // 对子目录递归调用
        deletedCount += await cleanHiddenFiles(fullPath);
      } else if (entry.name.startsWith('._')) {
        // 删除隐藏文件
        await unlink(fullPath);
        console.log(`已删除: ${fullPath}`);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`处理目录 ${directory} 时出错:`, error);
    return deletedCount;
  }
}

/**
 * 主函数
 */
async function main() {
  // 默认扫描测试目录
  const testDirectory = path.resolve(__dirname, '../__tests__');
  
  console.log('开始清理隐藏文件...');
  const deletedCount = await cleanHiddenFiles(testDirectory);
  
  if (deletedCount > 0) {
    console.log(`清理完成！共删除了 ${deletedCount} 个隐藏文件。`);
  } else {
    console.log('未发现需要清理的隐藏文件。');
  }
}

// 执行主函数
main().catch(err => {
  console.error('清理隐藏文件时发生错误:', err);
  process.exit(1);
}); 