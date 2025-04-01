const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG logo
const svgLogo = `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="10" y="35" font-family="Arial" font-size="24" font-weight="bold" fill="#3498db">ET资源小站</text>
  <circle cx="170" cy="30" r="20" fill="#3498db"/>
</svg>`;

// 确保assets目录存在
const assetsDir = path.join(__dirname, '../src/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 写入logo.svg文件
fs.writeFileSync(path.join(assetsDir, 'logo.svg'), svgLogo);
console.log('Logo SVG文件已创建: src/assets/logo.svg');

// 对HeaderComponent进行必要的修改
const headerPath = path.join(__dirname, '../src/components/common/HeaderComponent.vue');
if (fs.existsSync(headerPath)) {
  let headerContent = fs.readFileSync(headerPath, 'utf8');
  // 将logo.png引用替换为logo.svg
  headerContent = headerContent.replace(/['"]@\/assets\/logo\.png['"]/, '"@/assets/logo.svg"');
  fs.writeFileSync(headerPath, headerContent);
  console.log('HeaderComponent.vue已更新为使用SVG logo');
} 