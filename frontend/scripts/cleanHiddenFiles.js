/**
 * 跨平台隐藏文件清理脚本
 * 用于清理测试目录中的macOS隐藏文件和其他临时文件
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

/**
 * 清理指定模式的文件
 * @param {string} pattern - 要匹配的glob模式
 * @param {object} options - 配置选项
 * @returns {Promise<number>} - 清理的文件数量
 */
async function cleanFiles(pattern, options = {}) {
  // 使用glob v11 API
  const files = await glob(pattern, options);
  let count = 0;

  console.log(`找到 ${files.length} 个文件匹配模式 "${pattern}"`);
  
  for (const file of files) {
    try {
      await fs.unlink(file);
      console.log(`已删除: ${file}`);
      count++;
    } catch (err) {
      console.error(`删除失败: ${file}`, err.message);
    }
  }
  
  return count;
}

/**
 * 主函数 - 清理所有类型的隐藏文件
 */
async function main() {
  const baseDir = path.resolve(__dirname, '..');
  const testDir = path.join(baseDir, '__tests__');
  
  console.log('开始清理隐藏文件...');
  
  try {
    // 清理macOS隐藏文件 (以._开头)
    const macOSCount = await cleanFiles(path.join(testDir, '**', '._*'), { nodir: true });
    console.log(`清理了 ${macOSCount} 个macOS隐藏文件`);
    
    // 清理临时文件 (如有需要可添加其他模式)
    const tempCount = await cleanFiles(path.join(testDir, '**', '*.tmp'), { nodir: true });
    console.log(`清理了 ${tempCount} 个临时文件`);
    
    console.log('文件清理完成!');
    return macOSCount + tempCount;
  } catch (err) {
    console.error('清理过程中发生错误:', err);
    process.exit(1);
  }
}

// 直接运行脚本时执行
if (require.main === module) {
  main().then(count => {
    console.log(`总共清理了 ${count} 个文件`);
  });
}

// 导出函数供其他模块使用
module.exports = { cleanFiles, main }; 