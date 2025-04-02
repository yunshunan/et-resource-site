/**
 * 辅助函数，用于在浏览器控制台中模拟登录状态
 * 
 * 使用方法：
 * 1. 打开浏览器控制台 (F12 或 右键->检查)
 * 2. 输入 helper.login() 模拟登录
 * 3. 输入 helper.logout() 模拟退出
 */

window.helper = {
  // 模拟登录
  login: function() {
    const userInfo = {
      name: "测试用户",
      userId: "12345",
      email: "test@example.com", 
      role: "user"
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    console.log('已模拟登录状态，刷新页面查看效果');
    return '请刷新页面查看登录后的效果';
  },
  
  // 模拟退出
  logout: function() {
    localStorage.removeItem('userInfo');
    console.log('已退出登录，刷新页面查看效果');
    return '请刷新页面查看退出后的效果';
  }
};

console.log('辅助函数已加载，使用 helper.login() 模拟登录，使用 helper.logout() 退出'); 